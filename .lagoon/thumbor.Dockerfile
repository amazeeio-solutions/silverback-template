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
RUN chown 1000:0 /app
RUN fix-permissions /app
RUN mkdir -p /data/storage && chown -R 1000:0 /data
RUN fix-permissions /data