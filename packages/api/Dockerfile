# Stage 1: Setup pnpm
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Stage 2:
FROM base AS prepare

RUN pnpm add -g turbo@2

COPY . .

RUN turbo prune api --docker

FROM base AS builder

COPY --from=prepare /app/out/json .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY --from=prepare /app/out/full .

RUN pnpm turbo build

FROM node:24-alpine AS nexus-ui

COPY --from=builder /app/packages/api/dist ./

EXPOSE 5000

CMD ["node", "main.js"]