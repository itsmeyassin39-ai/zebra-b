# ── Stage 1: build the Vite frontend ──────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files for better layer caching
COPY package.json package-lock.json ./
COPY scripts/ ./scripts/

# Install all deps (devDependencies needed for vite build)
RUN npm ci

# Copy all source
COPY . .

# Build the Vite frontend → dist/
RUN npm run build

# ── Stage 2: lean production image ────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY scripts/ ./scripts/

# Install production deps + tsx (runs .ts server files without compiling)
RUN npm ci --omit=dev && \
    npm install --save-dev tsx typescript

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy everything the server needs at runtime:
#   server/ — Express routes & DB logic
#   src/data/ — product data imported by server/index.ts
#   src/types.ts — shared type imports
COPY server/ ./server/
COPY src/data/ ./src/data/
COPY src/types.ts ./src/types.ts
COPY tsconfig.json ./tsconfig.json

# Railway injects PORT automatically; default to 3001 for local docker runs
ENV PORT=3001
EXPOSE 3001

# Start the Express server (serves dist/ as static + /api routes)
CMD ["node", "--import", "tsx/esm", "server/index.ts"]
