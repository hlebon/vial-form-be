
FROM node:18-alpine AS builder

WORKDIR /usr/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /usr/app

COPY --from=builder /usr/app/package*.json ./

RUN npm install --production

COPY --from=builder /usr/app/dist ./dist
COPY --from=builder /usr/app/prisma ./prisma
COPY --from=builder /usr/app/node_modules/.prisma ./node_modules/.prisma

RUN echo '#!/bin/sh' > /usr/app/start.sh && \
    echo 'cd /usr/app' >> /usr/app/start.sh && \
    echo 'ls -la prisma/schema.prisma' >> /usr/app/start.sh && \
    echo 'npx prisma migrate deploy --schema=/usr/app/prisma/schema.prisma' >> /usr/app/start.sh && \
    echo 'node dist/src/index.js' >> /usr/app/start.sh && \
    chmod +x /usr/app/start.sh

EXPOSE 8080

CMD ["/usr/app/start.sh"]
