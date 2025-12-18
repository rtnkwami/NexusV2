FROM node:24-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN pnpm add -g turbo@2.6.3

COPY ./out/json ./

RUN pnpm install --frozen-lockfile

COPY ./out/full ./

RUN turbo build

RUN pnpm deploy --filter=api ./prod

FROM node:24-alpine AS nexus-api

WORKDIR /app

COPY --from=builder /app/prod/dist ./dist
COPY --from=builder /app/prod/node_modules ./node_modules
COPY --from=builder /app/prod/package.json ./pacakge.json

EXPOSE 5000

CMD ["node", "dist/main.js"]