# Stage 1: Setup pnpm
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

# Stage 2:
FROM base AS build

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./

COPY . ./

RUN pnpm fetch --prod

RUN pnpm install -r --offline --prod

RUN pnpm deploy --filter=@nexus/api --prod /prod/api

# Stage 3: Deployment
# API deployment
FROM base AS nexus-api

COPY --from=build /prod/api /app

WORKDIR /app

EXPOSE 5000

CMD [ "pnpm", "start:prod" ]