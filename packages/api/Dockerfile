FROM node:24-alpine AS nexus-api

WORKDIR /app

COPY ./api-build/prod .

EXPOSE 5000

CMD ["node", "dist/main.js"]