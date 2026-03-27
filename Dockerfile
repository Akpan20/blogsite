# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 1 — deps                                              ║
# ║  Installs PHP + Node dependencies in isolation.              ║
# ║  Rebuilt only when composer.json / package.json change.      ║
# ╚══════════════════════════════════════════════════════════════╝
FROM php:8.3-cli-bookworm AS deps

# System libs needed to compile PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl zip unzip \
        libzip-dev libpng-dev libonig-dev libxml2-dev \
        libssl-dev libcurl4-openssl-dev pkg-config ca-certificates openssl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# PHP extensions + MongoDB driver
RUN docker-php-ext-install zip mbstring exif pcntl bcmath \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
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

# Copy the full application on top of the installed dependencies
COPY . .

# Build Vite/React frontend
RUN npm run build

# Dummy env so artisan doesn't crash during cache warming at build time
ENV APP_KEY="base64:DummyKeyForBuildOnly32CharactersX="
ENV APP_ENV="production"
ENV DB_CONNECTION="mongodb"
ENV MONGODB_URI="mongodb://localhost:27017"
ENV MONGODB_DATABASE="blogsite"

# Optimise autoloader + warm Laravel caches
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

# Only the runtime system libs (no -dev packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip4 libpng16-16 libonig5 libxml2 \
        libssl3 libcurl4 ca-certificates openssl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled PHP extensions from the deps stage
COPY --from=deps /usr/local/lib/php/extensions /usr/local/lib/php/extensions
COPY --from=deps /usr/local/etc/php/conf.d     /usr/local/etc/php/conf.d

# Copy built application from the builder stage
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

# ── Startup ───────────────────────────────────────────────────
# Config:clear + re-cache here so real Render env vars are picked up,
# overwriting the dummy values baked in during the builder stage.
CMD ["sh", "-c", "\
    php artisan config:clear && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]