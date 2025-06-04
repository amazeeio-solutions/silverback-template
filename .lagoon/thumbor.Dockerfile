FROM ghcr.io/minimalcompact/thumbor:7.7.4

# /app/data might be used for other purposes in the container
RUN mkdir -p /app/data /data/storage && \
    chmod 775 /app/data /data/storage && \
    chown -R 1000:0 /app/data /data/storage
# Ensure thumbor.conf exists with proper permissions
RUN touch /app/thumbor.conf && chown 1000:0 /app/thumbor.conf && chmod 644 /app/thumbor.conf