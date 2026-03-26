FROM php:8.3-cli-bookworm

# ── 1. System dependencies ────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        git curl zip unzip \
        libzip-dev libpng-dev libonig-dev libxml2-dev \
        libssl-dev libcurl4-openssl-dev \
        pkg-config ca-certificates openssl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ── 2. PHP extensions ─────────────────────────────────────────────────────────
RUN docker-php-ext-install zip mbstring exif pcntl bcmath \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && echo "memory_limit=-1" > /usr/local/etc/php/conf.d/memory.ini

# ── 3. Node.js 20 ─────────────────────────────────────────────────────────────
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ── 4. Composer ───────────────────────────────────────────────────────────────
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# ── 5. PHP dependencies (cached layer — only re-runs if composer files change) ─
COPY composer.json composer.lock ./

RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# ── 6. Node dependencies (cached layer — only re-runs if package files change) ─
COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

# ── 7. Copy the rest of the application ──────────────────────────────────────
COPY . .

# ── 8. Build frontend assets ──────────────────────────────────────────────────
RUN npm run build

# ── 9. Autoload + permissions ─────────────────────────────────────────────────
RUN COMPOSER_MEMORY_LIMIT=-1 composer dump-autoload --optimize --no-scripts \
    && mkdir -p \
        storage/logs \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www

EXPOSE 8000

# ── 10. Runtime startup ───────────────────────────────────────────────────────
# package:discover, config:cache, etc. run here so they use real Render env vars
CMD ["sh", "-c", "\
    php artisan package:discover --ansi && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]