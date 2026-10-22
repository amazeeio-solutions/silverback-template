# Instead of using pgvector/pgvector:pg15 image, we use Lagoon's Postgres image
# (since it has lots of Lagoon related stuff), and install pgvector manually.
FROM uselagoon/postgres-15

# Recepie from https://stackoverflow.com/a/79466221/580371
WORKDIR /app
RUN apk add git build-base
RUN git clone --branch v0.8.0 --depth 1 https://github.com/pgvector/pgvector.git
WORKDIR /app/pgvector
# Skip LLVM JIT bitcode, so the build doesn't depend on the clang version
# the base image was built with.
RUN make with_llvm=no
RUN make install with_llvm=no

# Init script.
COPY .lagoon/postgrespgvector/init.sql /docker-entrypoint-initdb.d/01_pgvector.sql
