FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js db.js defaults.js seed.js init.sql ./

EXPOSE 3001

USER node

CMD ["node", "server.js"]
