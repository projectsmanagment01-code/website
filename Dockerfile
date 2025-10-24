# ========================
# Builder (deps + prisma client)
# ========================
FROM node:20-alpine3.18 AS builder
WORKDIR /app

# build-time args
ARG DATABASE_URL
ARG JWT_SECRET
ARG NODE_ENV=production
ARG SKIP_AUTH
ARG REVALIDATE_SECRET
ARG WEBHOOK_SECRET
ARG ADMIN_SECRET
ARG STATIC_EXPORT
ARG MOCK
ARG DB_PASSWORD

# make them available inside build phase too
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV NODE_ENV=${NODE_ENV}
ENV SKIP_AUTH=${SKIP_AUTH}
ENV REVALIDATE_SECRET=${REVALIDATE_SECRET}
ENV WEBHOOK_SECRET=${WEBHOOK_SECRET}
ENV ADMIN_SECRET=${ADMIN_SECRET}
ENV STATIC_EXPORT=${STATIC_EXPORT}
ENV MOCK=${MOCK}
ENV DB_PASSWORD=${DB_PASSWORD}

COPY package.json ./
RUN apk add --no-cache \
    vips-dev \
    vips-cpp \
    libjpeg-turbo-dev \
    libpng-dev \
    giflib-dev \
    librsvg-dev \
    libwebp-dev \
    tiff-dev \
    lcms2-dev \
    libexif-dev \
    libheif-dev \
    libimagequant-dev \
    libraw-dev \
    python3 \
    make \
    g++ \
    build-base

# Force Sharp to use correct platform
ENV npm_config_platform=linuxmusl
ENV npm_config_arch=x64
ENV SHARP_FORCE_PLATFORM=true

COPY package.json ./

RUN yarn
RUN yarn add --force @img/sharp-linuxmusl-x64


COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN yarn build

# ========================
# Runner (runtime only)
# ========================
FROM node:20-alpine3.18 AS runner
WORKDIR /app
ENV NODE_ENV=production

# copy envs through to runtime container as well
ARG DATABASE_URL
ARG JWT_SECRET
ARG NODE_ENV=production
ARG SKIP_AUTH
ARG REVALIDATE_SECRET
ARG WEBHOOK_SECRET
ARG ADMIN_SECRET
ARG STATIC_EXPORT
ARG MOCK
ARG DB_PASSWORD
ARG NEXT_PUBLIC_BASE_URL

ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV NODE_ENV=${NODE_ENV}
ENV SKIP_AUTH=${SKIP_AUTH}
ENV REVALIDATE_SECRET=${REVALIDATE_SECRET}
ENV WEBHOOK_SECRET=${WEBHOOK_SECRET}
ENV ADMIN_SECRET=${ADMIN_SECRET}
ENV STATIC_EXPORT=${STATIC_EXPORT}
ENV MOCK=${MOCK}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}

RUN mkdir -p uploads && chmod 755 uploads
RUN apk add --no-cache wget netcat-openbsd postgresql-client
RUN apk add --no-cache \
    vips \
    vips-cpp \
    libjpeg-turbo \
    libpng \
    giflib \
    librsvg \
    libwebp \
    tiff \
    lcms2 \
    libexif \
    libheif \
    libimagequant \
    libraw

COPY --from=builder /app .

# Copy startup script and make executable
COPY scripts/start-production.sh /start-production.sh
RUN chmod +x /start-production.sh

EXPOSE 3000



# ========================
# Builder (deps + prisma client)
# ========================

# Install ALL Sharp dependencies for Alpine

# ... rest of builder stage

# ========================
# Runner (runtime only)
# ========================

# Install RUNTIME Sharp dependencies for Alpine

# ... rest of runner stage

# Use safe startup script that handles baselining
CMD ["/start-production.sh"]
