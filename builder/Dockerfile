# Use the official Node.js 18 image as a base
FROM node:18

# Set ENV to non-interactive to prevent prompts during apt-get install
ENV DEBIAN_FRONTEND=noninteractive

# Switch to root user to install system packages
USER root
RUN apt-get update && apt-get install -y sudo ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list \
    && apt-get update && apt-get install -y google-cloud-sdk \
    && rm -rf /var/lib/apt/lists/*

# Add the gcloud SDK to the system PATH
ENV PATH /usr/lib/google-cloud-sdk/bin:$PATH

# --- PERMISSION FIX ---
# Create a directory for global npm packages and give the node user ownership
RUN mkdir -p /home/node/.npm-global && chown -R node:node /home/node/.npm-global

# Switch back to the non-root 'node' user
USER node

# Configure npm to use the new directory for global installs
RUN npm config set prefix '/home/node/.npm-global'

# Add the new npm global directory to the system PATH
ENV PATH /home/node/.npm-global/bin:$PATH

# Verify installations
RUN gcloud --version && npm --version