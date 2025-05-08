FROM ghcr.io/danny-avila/librechat-rag-api-dev-lite:latest

COPY .lagoon/fix-permissions /bin/

RUN mkdir -p /app/uploads && fix-permissions /app/uploads

ENV EMBEDDINGS_PROVIDER=openai \
    EMBEDDINGS_MODEL=embeddings \
    RAG_PORT=8800
