FROM node:18
ENV DEBIAN_FRONTEND=noninteractive
USER root
RUN apt-get update && apt-get install -y sudo ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" > /etc/apt/sources.list.d/google-cloud-sdk.list \
    && apt-get update && apt-get install -y google-cloud-sdk \
    && rm -rf /var/lib/apt/lists/*
ENV PATH /usr/lib/google-cloud-sdk/bin:$PATH
USER node
RUN gcloud --version && npm --version