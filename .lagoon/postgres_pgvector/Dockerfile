# Instead of using pgvector/pgvector:pg15 image, we use Lagoon's Postgres image
# (since it has lots of Lagoon related stuff), and install pgvector manually.
FROM uselagoon/postgres-15

# Recepie from https://stackoverflow.com/a/79466221/580371
WORKDIR /app
RUN apk add git build-base clang19 llvm19-dev
RUN git clone --branch v0.8.0 --depth 1 https://github.com/pgvector/pgvector.git
WORKDIR /app/pgvector
RUN make
RUN make install

# Init script.
COPY .lagoon/postgres_pgvector/init.sql /docker-entrypoint-initdb.d/01_pgvector.sql
