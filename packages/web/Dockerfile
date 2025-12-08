FROM node:24-alpine AS nexus-ui

WORKDIR /app

COPY ./web-build/prod .

EXPOSE 5000

CMD ["node", "dist/main.js"]