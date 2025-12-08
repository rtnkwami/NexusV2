FROM node:24-alpine AS nexus-ui

WORKDIR /app

COPY ./web-build/prod/.output .

EXPOSE 3000

CMD ["node", "server/index.mjs"]