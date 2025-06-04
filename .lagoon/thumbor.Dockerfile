FROM ghcr.io/minimalcompact/thumbor:7.7.4

# Create storage directories during image build
RUN mkdir -p /data/storage && chown -R 1000:1000 /data
# /app/data might be used for other purposes in the container
RUN mkdir -p /app/data && chown -R 1000:1000 /app/data

# Ensure thumbor.conf exists with proper permissions
RUN touch /app/thumbor.conf && chown 1000:0 /app/thumbor.conf && chmod 644 /app/thumbor.conf

# Save the original entrypoint if it exists
RUN if [ -f /docker-entrypoint.sh ]; then cp /docker-entrypoint.sh /original-entrypoint.sh; fi

COPY .lagoon/thumbor_entrypoint.sh /thumbor_entrypoint.sh
RUN chmod +x /thumbor_entrypoint.sh

#ENTRYPOINT ["/thumbor_entrypoint.sh"]
#CMD ["thumbor"]