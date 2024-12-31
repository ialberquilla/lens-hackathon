# Use Ubuntu as base image
FROM ubuntu:22.04

# Install Node.js and npm
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create a startup script
RUN echo '#!/bin/bash\nollama serve &\nsleep 5\nnode src/index.js' > start.sh \
    && chmod +x start.sh

# Expose port
EXPOSE 3001

# Start both Ollama and the Node.js app
CMD ["./start.sh"] 