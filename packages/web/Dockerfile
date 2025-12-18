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

RUN pnpm deploy --filter=web --prod ./prod

FROM node:24-alpine AS nexus-ui

WORKDIR /app

COPY --from=builder /app/prod/.output ./.output
COPY --from=builder /app/prod/package.json ./package.json

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]