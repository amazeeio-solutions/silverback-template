FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    zsh

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs
RUN node --version

# Install pnpm 8.6+
RUN npm install -g pnpm@8.6.12
RUN pnpm --version

# Install SQLite
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev

# Install additional PHP extensions for Drupal
RUN docker-php-ext-install opcache
RUN pecl install apcu && docker-php-ext-enable apcu

# Install and enable Xdebug
RUN pecl install xdebug && docker-php-ext-enable xdebug

# Configure Xdebug for remote debugging
RUN echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/xdebug.ini && \
    echo "xdebug.log=/tmp/xdebug.log" >> /usr/local/etc/php/conf.d/xdebug.ini

# Install Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended && \
    # Set Zsh as the default shell
    chsh -s /bin/zsh && \
    # Change ownership of the .oh-my-zsh directory
    chmod -R 755 /root/.oh-my-zsh

# Set up a basic .zshrc configuration
RUN cp /root/.oh-my-zsh/templates/zshrc.zsh-template /root/.zshrc && \
    sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="agnoster"/g' /root/.zshrc

    # RUN nvm use 18
# RUN npm i -g pnpm@8.6.12

WORKDIR /workspaces/silverback-template/apps/cms
RUN apt-get update && apt-get install -y git qpdf imagemagick libicu-dev && \
    docker-php-ext-install intl && \
    docker-php-ext-enable intl
RUN composer config --global github-protocols https

# Change document root for Apache
RUN sed -ri -e 's!/var/www/html!/var/www/html/web!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!/var/www/html/web!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install Helix editor
# RUN apt-get update && apt-get install -y software-properties-common && \
#     add-apt-repository ppa:maveonair/helix-editor && \
#     apt-get update && \
#     apt-get install -y helix

# Install phpactor
RUN curl -Lo phpactor.phar https://github.com/phpactor/phpactor/releases/latest/download/phpactor.phar && \
    chmod a+x phpactor.phar && \
    mv phpactor.phar /usr/local/bin/phpactor

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install gh -y

ENV NETLIFY_URL=http://localhost:8000
ENV DRUPAL_EXTERNAL_URL=http://localhost:8888
ENV DRUPAL_INTERNAL_URL=http://127.0.0.1:8888
ENV PUBLISHER_URL=http://localhost:8000

# Enable Apache modules
RUN a2enmod rewrite
