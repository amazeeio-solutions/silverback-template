FROM gitpod/workspace-full

RUN bash -c 'VERSION="20.18.1" \
    && source $HOME/.nvm/nvm.sh && nvm install $VERSION \
    && nvm use $VERSION && nvm alias default $VERSION'

RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix

RUN sudo update-alternatives --set php $(which php8.3)
RUN sudo install-packages php8.3-gd php8.3-mbstring php8.3-curl php8.3-sqlite3 php8.3-zip php8.3-xdebug php8.3-imagick
RUN pnpx playwright@1.32.3 install-deps
RUN pnpx playwright@1.32.3 install
RUN npm install -g pnpm@8.15.9 @withgraphite/graphite-cli

COPY .gitpod/xdebug.ini /etc/php/8.3/mods-available/xdebug.ini
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
RUN /home/gitpod/.deno/bin/deno completions bash > /home/gitpod/.bashrc.d/90-deno && \
  echo 'export DENO_INSTALL="/home/gitpod/.deno"' >> /home/gitpod/.bashrc.d/90-deno && \
  echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> /home/gitpod/.bashrc.d/90-deno

RUN sudo add-apt-repository ppa:maveonair/helix-editor && \
    sudo apt update && \
    sudo apt install helix

# Install phpactor
RUN curl -Lo phpactor.phar https://github.com/phpactor/phpactor/releases/latest/download/phpactor.phar
RUN chmod a+x phpactor.phar
RUN sudo mv phpactor.phar /usr/local/bin/phpactor
# Install gh cli
RUN sudo install-packages gh
