# ====================================================================================================
# BUILDER IMAGE
# ====================================================================================================
FROM uselagoon/node-20-builder as node
FROM uselagoon/php-8.3-cli-drupal as builder

COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# Install pnpm
RUN npm install -g pnpm@8.15.9 && pnpm config set store-dir /tmp/cache/pnpm

# Copy pnpm lockfile and install dependencies.
COPY pnpm-lock.yaml .npmrc /app/
# COPY patches /app/patches
RUN --mount=type=cache,target=/tmp/cache pnpm fetch && \
    # There is a bug in pnpm: `pnpm fetch` creates _some_ node_modules folders
    # with _some_ packages. This can lead to an incomplete package installation.
    # So we remove them now.
    find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Install composer dependencies.
# They may contain directive definitions required by prep scripts.
WORKDIR /app/apps/cms
RUN apk add --no-cache git qpdf imagemagick icu-dev && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl
RUN composer config --global github-protocols https
COPY apps/cms/composer.* /app/apps/cms/
COPY apps/cms/patches /app/apps/cms/patches
COPY apps/cms/scaffold /app/apps/cms/scaffold
ENV COMPOSER_HOME=/tmp/cache/composer
RUN --mount=type=cache,target=/tmp/cache composer install --no-dev

WORKDIR /app

# Decap config.
ENV VITE_DECAP_REPO='AmazeeLabs/silverback-template'
ARG LAGOON_GIT_BRANCH
ENV VITE_DECAP_BRANCH="$LAGOON_GIT_BRANCH"

# Copy the all package sources, install and prepare them.
COPY . /app
RUN --mount=type=cache,target=/tmp/cache pnpm i && \
    pnpm turbo:prep && \
    # Remove all node_modules to reduce the size of the image.
    find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Deploy apps.
RUN --mount=type=cache,target=/tmp/cache pnpm deploy --filter "@custom/cms" /tmp/.deploy/cms --prod
RUN --mount=type=cache,target=/tmp/cache pnpm deploy --filter "@custom/publisher" /tmp/.deploy/publisher --prod
RUN --mount=type=cache,target=/tmp/cache pnpm deploy --filter "@custom/preview" /tmp/.deploy/preview --prod

# ====================================================================================================
# CLI IMAGE
# ====================================================================================================
FROM uselagoon/php-8.3-cli-drupal as cli

RUN apk add --no-cache git qpdf imagemagick icu-dev && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl

COPY --from=builder /tmp/.deploy/cms /app

WORKDIR /app
ENV WEBROOT=web
# To not meet OOM on Drupal config import.
ENV PHP_MEMORY_LIMIT=2048M

# ====================================================================================================
# PHP IMAGE
# ====================================================================================================
FROM uselagoon/php-8.3-fpm as php
RUN apk add --no-cache imagemagick qpdf icu-dev && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl

COPY --from=cli /app /app

WORKDIR /app
ENV WEBROOT=web
# Keep EX nice when running static builds.
ENV PHP_MEMORY_LIMIT=2048M

# ====================================================================================================
# NGINX IMAGE
# ====================================================================================================
FROM uselagoon/nginx-drupal as nginx

COPY --from=cli /app /app
RUN cd /app/web && cp ../node_modules/@custom/ui/build/gutenberg.css .
RUN cd /app/web && cp ../node_modules/@custom/ui/build/iframe.css .
COPY .lagoon/nginx-conf/redirects-map.conf /etc/nginx/redirects-map.conf

WORKDIR /app
ENV WEBROOT=web

# ====================================================================================================
# PREVIEW IMAGE
# ====================================================================================================

FROM uselagoon/node-20 as preview

RUN npm install -g pnpm@8.15.9
COPY --from=builder /tmp/.deploy/preview /app
CMD pnpm start

# ====================================================================================================
# PUBLISHER IMAGE
# ====================================================================================================

FROM uselagoon/node-20 as publisher

RUN apk add --no-cache sqlite curl github-cli

RUN npm install -g pnpm@8.15.9

COPY --from=builder /tmp/.deploy/publisher /app

# Decap config.
ENV VITE_DECAP_REPO='AmazeeLabs/silverback-template'
ARG LAGOON_GIT_BRANCH
ENV VITE_DECAP_BRANCH="$LAGOON_GIT_BRANCH"

CMD pnpm publisher
