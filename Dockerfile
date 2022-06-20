FROM node:16-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 polleruser

COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=polleruser:nodejs /app/sqsPoller.js ./sqsPoller.js

USER polleruser

EXPOSE 3001

ENV PORT 3001

CMD ["node", "sqsPoller.js"]
