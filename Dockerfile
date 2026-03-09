# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.10-alpine AS build
WORKDIR /app
ENV DATABASE_URL=file:./prisma/data/submanager.db

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bun run postinstall
RUN bun run build

FROM oven/bun:1.3.10-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:./prisma/data/submanager.db

# Keep SQLite directory available when DATABASE_URL points to ./prisma/data/*.db
RUN mkdir -p /app/prisma/data

COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["bun", "run", ".output/server/index.mjs"]
