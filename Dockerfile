FROM node:20-bookworm

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_PATH=/app/data/searchindex.db

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY public ./public
COPY docs ./docs
COPY scripts ./scripts
COPY server.js ./
COPY default-state.json ./
COPY README.md ./
COPY OPTIMIZATION_LOG.md ./

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "server.js"]
