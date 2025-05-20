FROM uselagoon/python-3.13
ENV PYTHONUNBUFFERED 1
ENV LAGOON=python

# Install build dependencies (including clang, lld, and curl)
RUN apk add --no-cache clang lld curl

# Download and install the Rust toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Add the Rust toolchain to PATH
ENV PATH="$HOME/.cargo/bin:${PATH}"

# RUN apk add curl gcc make
# RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# ENV PATH="/root/.cargo/bin:${PATH}"
RUN ls $HOME/.cargo/bin

COPY apps/chat/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/chat/app.py .
CMD ["chainlit", "run", "--host", "0.0.0.0", "--port", "8800"]
