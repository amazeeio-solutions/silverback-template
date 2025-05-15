FROM ghcr.io/danny-avila/librechat-dev:latest

USER 0

COPY .lagoon/fix-permissions /bin/

RUN mkdir -p /app/api/logs /app/uploads /app/client/public/images \
    && fix-permissions /app/api/logs \
    && fix-permissions /app/uploads \
    && fix-permissions /app/client/public/images

# Create deno.json to enable node_modules
RUN echo '{"nodeModulesDir": "auto"}' > /app/deno.json

RUN npm install -g mcp-graphql

ENV MONGO_URI=mongodb://mongodb:27017/LibreChat \
    RAG_API_URL=http://rag-api:8800 \
    HOST=0.0.0.0 \
    PORT=3000 \
    NO_INDEX=true \
    TRUST_PROXY=1 \
    CONSOLE_JSON=false \
    DEBUG_LOGGING=true \
    DEBUG_CONSOLE=false \
    ENDPOINTS=custom,agents \
    DEBUG_PLUGINS=true \
    CREDS_KEY=f34be427ebb29de8d88c107a71546019685ed8b241d8f2ed00c3df97ad2566f0 \
    CREDS_IV=e2341419ec3dd3d19b13a1a87fafcbfb \
    BAN_VIOLATIONS=true \
    BAN_DURATION=1000*60*60*2 \
    BAN_INTERVAL=20 \
    LOGIN_VIOLATION_SCORE=1 \
    REGISTRATION_VIOLATION_SCORE=1 \
    CONCURRENT_VIOLATION_SCORE=1 \
    MESSAGE_VIOLATION_SCORE=1 \
    NON_BROWSER_VIOLATION_SCORE=20 \
    LOGIN_MAX=7 \
    LOGIN_WINDOW=5 \
    REGISTER_MAX=5 \
    REGISTER_WINDOW=60 \
    LIMIT_CONCURRENT_MESSAGES=true \
    CONCURRENT_MESSAGE_MAX=2 \
    LIMIT_MESSAGE_IP=true \
    MESSAGE_IP_MAX=40 \
    MESSAGE_IP_WINDOW=1 \
    LIMIT_MESSAGE_USER=false \
    MESSAGE_USER_MAX=40 \
    MESSAGE_USER_WINDOW=1 \
    ILLEGAL_MODEL_REQ_SCORE=5 \
    ALLOW_EMAIL_LOGIN=true \
    ALLOW_REGISTRATION=true \
    ALLOW_SOCIAL_LOGIN=false \
    ALLOW_SOCIAL_REGISTRATION=false \
    ALLOW_PASSWORD_RESET=false \
    ALLOW_UNVERIFIED_EMAIL_LOGIN=true \
    JWT_SECRET=16f8c0ef4a5d391b26034086c628469d3f9f497f08163ab9b40137092f2909ef \
    JWT_REFRESH_SECRET=eaa5191f2914e30b9387fd84e254e4ba6fc51b4654968a9b0803b456a54b8418 \
    ALLOW_SHARED_LINKS=true \
    ALLOW_SHARED_LINKS_PUBLIC=true \
    APP_TITLE=LibreChat \
    HELP_AND_FAQ_URL=https://librechat.ai

COPY apps/librechat/librechat.yaml /app/librechat.yaml
