# Use the official Bun image
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Create a directory for persistent data
RUN mkdir -p /app/data

# Set environment variables for terminal support
ENV TERM=xterm-256color
ENV FORCE_COLOR=1

# Set the progress file location to the persistent volume
ENV PROGRESS_DIR=/app/data

# Make sure the entry point is executable
RUN chmod +x index.tsx

# Run the application
CMD ["bun", "run", "index.tsx"]