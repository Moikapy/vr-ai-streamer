FROM oven/bun AS base

WORKDIR /app

# Copy package.json and bun.lockb (if exists)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code and VRM model
COPY . .

# Ensure VRM model is present
RUN test -f public/models/avatar.vrm || { echo "Error: avatar.vrm not found in public/models"; exit 1; }

# Expose ports for Next.js (3000) and WebSocket server (3001)
EXPOSE 3000 3001

# Default command (overridden in docker-compose)
CMD ["bun", "run", "dev"]