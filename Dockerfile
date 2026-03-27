# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 1 — deps                                              ║
# ║  Installs PHP + Node dependencies in isolation.              ║
# ╚══════════════════════════════════════════════════════════════╝
FROM php:8.3-cli-bookworm AS deps

# System libs
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl zip unzip \
        libzip-dev libpng-dev libonig-dev libxml2-dev \
        libssl-dev libcurl4-openssl-dev pkg-config ca-certificates openssl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions — use install-php-extensions for fast pre-built mongodb
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions zip mbstring exif pcntl bcmath mongodb \
    && echo "memory_limit=-1" > /usr/local/etc/php/conf.d/memory.ini

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# ── PHP deps (cached layer) ───────────────────────────────────
COPY composer.json composer.lock ./
RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# ── Node deps (cached layer) ──────────────────────────────────
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps


# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 2 — builder                                           ║
# ║  Copies full app, builds frontend, warms Laravel caches.     ║
# ╚══════════════════════════════════════════════════════════════╝
FROM deps AS builder

COPY . .

# Build Vite/React frontend — fail loudly if output is missing
RUN npm run build \
    && ls public/build/assets \
    || (echo "❌ Vite build failed or output missing" && exit 1)

# Dummy env so artisan doesn't crash during cache warming
ENV APP_KEY="base64:DummyKeyForBuildOnly32CharactersX="
ENV APP_ENV="production"
ENV DB_CONNECTION="mongodb"
ENV MONGODB_URI="mongodb://127.0.0.1:27017"
ENV MONGODB_DATABASE="blogsite"

RUN COMPOSER_MEMORY_LIMIT=-1 composer dump-autoload --optimize --no-scripts \
    && php artisan package:discover --ansi \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache


# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 3 — runtime                                           ║
# ║  Lean final image — no compiler tools, no Node, no Composer. ║
# ╚══════════════════════════════════════════════════════════════╝
FROM php:8.3-cli-bookworm AS runtime

# Runtime system libs only
RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip4 libpng16-16 libonig5 libxml2 \
        libssl3 libcurl4 ca-certificates openssl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy pre-built PHP extensions from deps stage
COPY --from=deps /usr/local/lib/php/extensions /usr/local/lib/php/extensions
COPY --from=deps /usr/local/etc/php/conf.d     /usr/local/etc/php/conf.d

# Copy built application from builder stage
COPY --from=builder /app /var/www

WORKDIR /var/www

# Correct permissions
RUN mkdir -p storage/logs \
             storage/framework/cache \
             storage/framework/sessions \
             storage/framework/views \
             bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www

EXPOSE 8000

# Re-cache config at startup so real Render env vars override build-time dummies
CMD ["sh", "-c", "\
    php artisan config:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]