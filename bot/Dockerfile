# Dockerfile — LuminaBot, Node 20 Alpine.
FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .

ENV NODE_ENV=production
ENV DATA_DIR=/app/data

# Persist data via a volume mounted at /app/data
VOLUME ["/app/data"]

CMD ["node", "index.js"]
