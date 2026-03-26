FROM php:8.3-cli-bookworm

# 1. System Dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev \
    libonig-dev libxml2-dev pkg-config \
    libssl-dev ca-certificates openssl \
    libcurl4-openssl-dev \
    && update-ca-certificates --fresh \
    && rm -rf /var/lib/apt/lists/*

# 2. PHP Extensions
RUN docker-php-ext-install zip mbstring exif pcntl bcmath \
    && pecl install mongodb-1.17.0 \
    && docker-php-ext-enable mongodb

# 3. Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 4. Raise PHP memory limit for Composer
RUN echo "memory_limit=-1" > /usr/local/etc/php/conf.d/memory.ini

# 5. Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www

# 6. Install PHP dependencies
COPY composer.json composer.lock ./
RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
    --no-dev \
    --optimize-autoloader \
    --no-scripts \
    --no-interaction \
    --prefer-dist

# 7. Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# 8. Copy app code & build frontend
COPY . .
ENV APP_KEY="base64:DummyKeyForBuildOnly="
RUN npm run build

# 9. Run composer scripts now that full app is present
RUN COMPOSER_MEMORY_LIMIT=-1 composer dump-autoload --optimize

# 10. Permissions
RUN mkdir -p storage/logs storage/framework/cache \
    storage/framework/sessions storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www

EXPOSE 8000

CMD ["sh", "-c", "php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]