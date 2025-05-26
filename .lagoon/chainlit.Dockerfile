FROM uselagoon/python-3.13
ENV PYTHONUNBUFFERED 1
ENV LAGOON=python

# Install build dependencies (including clang, lld, and curl)
RUN apk add --no-cache clang lld curl nodejs npm
RUN npm install -g mcp-graphql

# Download and install the Rust toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Add the Rust toolchain to PATH
ENV PATH="$HOME/.cargo/bin:${PATH}"

# RUN apk add curl gcc make
# RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# ENV PATH="/root/.cargo/bin:${PATH}"
RUN ls $HOME/.cargo/bin
ENV CHAINLIT_APP_ROOT=/app

WORKDIR /app
COPY apps/chat/db_utils.py .
COPY apps/chat/requirements.txt .
COPY apps/chat/chainlit.md .
COPY apps/chat/.chainlit .chainlit
COPY apps/chat/app.py .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["/bin/sh", "-c", "chainlit run app.py --host 0.0.0.0 --port 8800"]
