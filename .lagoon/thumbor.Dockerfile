FROM ghcr.io/minimalcompact/thumbor:7.7.4

COPY <<'EOF' /usr/local/bin/fix-permissions
#!/bin/sh
# Fix permissions on the given directory to allow group read/write of
# regular files and execute of directories.
find -L "$1" -exec chgrp 0 {} +
find -L "$1" -exec chmod g+rwX {} +
EOF

RUN chmod +x /usr/local/bin/fix-permissions

# Set full permissions on the /app directory
RUN chmod 777 /app
RUN chown 1000:0 /app
RUN fix-permissions /app
#
## Ensure the template file has the right permissions
#RUN chmod 644 /app/thumbor.conf.tpl && chown 1000:0 /app/thumbor.conf.tpl && \
#    if [ -f /app/thumbor.conf ]; then echo "thumbor.conf exists"; else echo "thumbor.conf does not exist"; fi && \
#    ls -la /app/thumbor*
#RUN chmod 644 /app/requirements.txt && chown 1000:0 /app/requirements.txt
#
## Create necessary directories with correct permissions
#RUN mkdir -p /data/storage && chown -R 1000:0 /data
#RUN mkdir -p /app/data && chown -R 1000:0 /app/data
#
## Make sure the entrypoint script is executable
#RUN chmod +x /docker-entrypoint.sh