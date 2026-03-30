FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY prisma/ ./prisma/
COPY openapi.yaml ./
COPY .env.production ./.env

RUN npm run prisma:generate

EXPOSE 3000

CMD ["npm", "start"]
