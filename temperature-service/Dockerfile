FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

FROM base AS build
WORKDIR /usr/src/app
COPY --chown=node:node . .
RUN pnpm install
RUN pnpm build
RUN pnpm install -P
USER node

FROM base AS production
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/src ./src
COPY --chown=node:node --from=build /usr/src/app/package.json .
CMD [ "node", "dist/main.js" ]
