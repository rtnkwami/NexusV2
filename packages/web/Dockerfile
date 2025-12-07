# Stage 1
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Stage 2
FROM base AS prepare

RUN pnpm add -g turbo@2

COPY . .

RUN turbo prune web --docker

# Stage 3
FROM base AS builder

COPY --from=prepare /app/out/json .

RUN pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full .

RUN pnpm turbo build

RUN pnpm deploy --filter=web ./prod

# Stage 4
FROM node:24-alpine AS nexus-ui

WORKDIR /app

COPY --from=builder /app/prod .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", ".output/server/index.mjs"]