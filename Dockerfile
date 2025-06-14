FROM oven/bun:1.2.16 as dependencies
WORKDIR /app
COPY bun.lockb package.json ./
RUN bun install

FROM oven/bun:1.2.16 as builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM oven/bun:1.2.16 as runner
WORKDIR /app
ENV PORT=3050
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