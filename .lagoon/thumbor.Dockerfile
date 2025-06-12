FROM ghcr.io/minimalcompact/thumbor:7.7.4

USER root

# Don't create thumbor.conf directly - just make sure the directory has the right permissions
RUN chown 1000:0 /app && chmod 775 /app

# Ensure the template file has the right permissions
RUN chmod 644 /app/thumbor.conf.tpl && chown 1000:0 /app/thumbor.conf.tpl

# Create necessary directories with correct permissions
RUN mkdir -p /data/storage && chown -R 1000:0 /data
RUN mkdir -p /app/data && chown -R 1000:0 /app/data

# Make sure the entrypoint script is executable
RUN chmod +x /docker-entrypoint.sh

# Switch back to the thumbor user
USER 1000