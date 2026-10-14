# ====================================================================================================
# BUILDER IMAGE
# ====================================================================================================
FROM uselagoon/node-22-builder AS node
FROM uselagoon/php-8.4-cli-drupal AS builder

COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin/node /usr/local/bin/node
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

# Install pnpm
RUN npm install -g pnpm@8.15.9 && pnpm config set store-dir /tmp/cache/pnpm

# sqlite3 and unix-dgram ship no prebuilt binaries for Node 22 on musl, so
# node-gyp compiles them from source during "pnpm fetch". py3-setuptools
# restores "distutils", which Python 3.12 removed but node-gyp still imports.
RUN apk add --no-cache python3 py3-setuptools make g++

# Copy pnpm lockfile and install dependencies.
COPY pnpm-lock.yaml .npmrc /app/
# COPY patches /app/patches
RUN --mount=type=cache,target=/tmp/cache pnpm fetch && \
    # There is a bug in pnpm: `pnpm fetch` creates _some_ node_modules folders
    # with _some_ packages. This can lead to an incomplete package installation.
    # So we remove them now.
    find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Prepare everything for "composer install".
WORKDIR /app/apps/cms
RUN apk add --no-cache git qpdf imagemagick icu-dev && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl
RUN composer config --global github-protocols https
COPY apps/cms/composer.* /app/apps/cms/
COPY apps/cms/patches /app/apps/cms/patches
COPY apps/cms/scaffold /app/apps/cms/scaffold
ENV COMPOSER_HOME=/tmp/cache/composer

WORKDIR /app

# Decap config.
ENV VITE_DECAP_REPO='amazeeio-solutions/silverback-template'
ARG LAGOON_GIT_BRANCH
ENV VITE_DECAP_BRANCH="$LAGOON_GIT_BRANCH"

# Copy the all package sources, install and prepare them.
COPY . /app
RUN --mount=type=cache,target=/tmp/cache pnpm i && \
    # "composer install" needs to be executed
    # - after "pnpm i" because some Composer packages are stored inside NPM
    #   dependencies
    # - before "pnpm turbo:prep" because some Composer packages may contain
    #   GraphQL directives required by prep scripts
    cd /app/apps/cms && composer install --no-dev --optimize-autoloader && cd - && \
    pnpm turbo:prep && \
    # Remove all node_modules to reduce the size of the image.
    find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +

# Deploy apps.
RUN --mount=type=cache,target=/tmp/cache pnpm deploy --filter "@custom/cms" /tmp/.deploy/cms --prod && \
    # We need to composer install again as node_modules were removed above and we need these ones
    # for Drupal packages stored in node_modules.
    cd /tmp/.deploy/cms && composer install --no-dev --optimize-autoloader
RUN --mount=type=cache,target=/tmp/cache pnpm deploy --filter "@custom/publisher" /tmp/.deploy/publisher --prod
RUN --mount=type=cache,target=/tmp/cache pnpm deploy --filter "@custom/preview" /tmp/.deploy/preview --prod

# ====================================================================================================
# CLI IMAGE
# ====================================================================================================
FROM uselagoon/php-8.4-cli-drupal AS cli

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
FROM uselagoon/php-8.4-fpm AS php
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
FROM uselagoon/nginx-drupal AS nginx

COPY --from=cli /app /app
RUN cd /app/web && cp ../node_modules/@custom/ui/build/gutenberg.css .
RUN cd /app/web && cp ../node_modules/@custom/ui/build/iframe.css .
COPY .lagoon/nginx-conf/redirects-map.conf /etc/nginx/redirects-map.conf

WORKDIR /app
ENV WEBROOT=web

# ====================================================================================================
# PREVIEW IMAGE
# ====================================================================================================

FROM uselagoon/node-22 AS preview

RUN npm install -g pnpm@8.15.9
COPY --from=builder /tmp/.deploy/preview /app
CMD pnpm start

# ====================================================================================================
# PUBLISHER IMAGE
# ====================================================================================================

FROM uselagoon/node-22 AS publisher

RUN apk add --no-cache sqlite curl

RUN npm install -g pnpm@8.15.9

COPY --from=builder /tmp/.deploy/publisher /app

# Decap config.
ENV VITE_DECAP_REPO='amazeeio-solutions/silverback-template'
ARG LAGOON_GIT_BRANCH
ENV VITE_DECAP_BRANCH="$LAGOON_GIT_BRANCH"

CMD pnpm publisher
