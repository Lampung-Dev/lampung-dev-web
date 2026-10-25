# Dependencies are installed with Bun (bun.lockb), but Next.js is built and run
# on Node.js. The oven/bun image ships no Node and symlinks `node` to Bun, so
# `next build` ran on the Bun runtime and crashed while collecting page data
# ("Expected CommonJS module to have a function wrapper ... this is a bug in Bun").
# Both images below are Debian bookworm (glibc), so native modules such as sharp
# installed in the first stage work in the later ones.

FROM oven/bun:1.2.16 AS dependencies
WORKDIR /app
COPY bun.lockb package.json ./
RUN bun install

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=dependencies /usr/local/bin/bun /usr/local/bin/bun
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3050
# Bun is kept only as the script runner (`bun db:migrate && bun start`);
# with real Node on PATH, the Next.js server itself runs on Node.
COPY --from=dependencies /usr/local/bin/bun /usr/local/bin/bun
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tailwind.config.ts ./tailwind.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/*.ts ./
COPY --from=builder /app/src ./src
EXPOSE 3050
