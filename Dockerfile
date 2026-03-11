# syntax=docker/dockerfile:1.7

FROM oven/bun:1.3.10-alpine AS build
WORKDIR /app
ENV DATABASE_URL=file:./prisma/data/clashrouter.db

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .
RUN bun run postinstall
RUN bun run build

# Build a template SQLite database with all migrations applied.
RUN mkdir -p /app/prisma/data \
    && DATABASE_URL=file:./prisma/data/template.db bunx --bun prisma migrate deploy

FROM build AS migrator
CMD ["bunx", "--bun", "prisma", "migrate", "deploy"]

FROM oven/bun:1.3.10-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:./prisma/data/clashrouter.db

# Keep SQLite directory available when DATABASE_URL points to ./prisma/data/*.db
RUN mkdir -p /app/prisma/data

COPY --from=build /app/prisma/data/template.db /app/prisma/template.db
COPY --from=build /app/.output ./.output

EXPOSE 3000

CMD ["sh", "-c", "if [ \"${DATABASE_URL#file:}\" != \"$DATABASE_URL\" ]; then db_path=\"${DATABASE_URL#file:}\"; mkdir -p \"$(dirname \"$db_path\")\"; [ -f \"$db_path\" ] || cp /app/prisma/template.db \"$db_path\"; fi; exec bun run .output/server/index.mjs"]
