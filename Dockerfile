FROM php:8.3-fpm-bookworm 

# ── 1. System dependencies ────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl zip unzip libzip-dev libpng-dev libonig-dev libxml2-dev \
        libssl-dev libcurl4-openssl-dev pkg-config ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install zip mbstring exif pcntl bcmath \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && echo "memory_limit=-1" > /usr/local/etc/php/conf.d/memory.ini

# ── 2. Node.js 20 ─────────────────────────────────────────────────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── 3. Composer ───────────────────────────────────────────────────────────────
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ── 4. Copy dependency files first (for better caching) ───────────────────────
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --optimize-autoloader --ignore-platform-reqs

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# ── 5. Copy the entire application ────────────────────────────────────────────
COPY . .

# ── 6. Build frontend assets (Critical Step) ──────────────────────────────────
RUN npm run build

# ── 7. Optimize Laravel (after build) ─────────────────────────────────────────
RUN composer dump-autoload --optimize --no-scripts \
    && php artisan package:discover --ansi \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# ── 8. Set correct permissions ────────────────────────────────────────────────
RUN mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www

EXPOSE 8000

# ── 9. Final startup command ──────────────────────────────────────────────────
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]