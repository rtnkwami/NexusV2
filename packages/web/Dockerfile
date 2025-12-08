FROM node:24-alpine AS nexus-ui

WORKDIR /app

COPY ./web-build/prod/ .

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]