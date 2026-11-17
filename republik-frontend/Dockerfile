FROM node:22-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ARG NEXT_PUBLIC_SITE_URL=https://republik.com.br
ARG NEXT_PUBLIC_APP_NAME=Republik
ARG NEXT_PUBLIC_DPO_EMAIL=privacidade@republik.com.br
ARG NEXT_PUBLIC_SUPPORT_WHATSAPP=5511972331902
ARG NEXT_PUBLIC_CSRF_COOKIE_NAME=republik_csrf_token
ARG NEXT_PUBLIC_CSRF_HEADER_NAME=x-csrf-token

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
ENV NEXT_PUBLIC_DPO_EMAIL=${NEXT_PUBLIC_DPO_EMAIL}
ENV NEXT_PUBLIC_SUPPORT_WHATSAPP=${NEXT_PUBLIC_SUPPORT_WHATSAPP}
ENV NEXT_PUBLIC_CSRF_COOKIE_NAME=${NEXT_PUBLIC_CSRF_COOKIE_NAME}
ENV NEXT_PUBLIC_CSRF_HEADER_NAME=${NEXT_PUBLIC_CSRF_HEADER_NAME}

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["npm", "run", "start"]
