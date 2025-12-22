FROM node:24-alpine AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

RUN pnpm add -g turbo@2.6.3

COPY ./out/json ./

# Dummy url for prisma client generation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN pnpm install --frozen-lockfile

COPY ./out/full ./

RUN pnpm generate:prisma

RUN turbo build

RUN pnpm deploy --filter=api --prod ./prod

FROM node:24-alpine AS nexus-api

WORKDIR /app

COPY --from=builder /app/prod/dist ./dist
COPY --from=builder /app/prod/node_modules ./node_modules
COPY --from=builder /app/prod/package.json ./package.json

EXPOSE 5000

CMD ["node", "dist/main.js"]