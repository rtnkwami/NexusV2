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

RUN pnpm deploy --filter=web ./prod

FROM builder AS nexus-ui

WORKDIR /app

COPY --from=builder /app/prod ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]