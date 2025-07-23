FROM node:18

# Install Google Cloud SDK
RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates gnupg curl && \
    mkdir -p /usr/share/keyrings && \
    curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    apt-get update -y && \
    apt-get install -y google-cloud-cli && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables similar to GitHub Actions
ENV GITHUB_SHA="example-sha" \
    GITHUB_REF="refs/heads/main"

# Set the working directory
WORKDIR /workspace

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Start a shell
CMD ["/bin/bash"]

