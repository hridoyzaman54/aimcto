# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"

ARG PNPM_VERSION=latest
RUN npm install -g pnpm@$PNPM_VERSION


FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy package files AND patches folder before installing
COPY package-lock.json package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN pnpm install --frozen-lockfile --prod=false

COPY . .

RUN pnpm run build

RUN pnpm prune --prod


FROM base

COPY --from=build /app /app

# Match the port in fly.toml (internal_port = 8080)
EXPOSE 8080
CMD [ "pnpm", "run", "start" ]
