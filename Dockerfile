FROM php:8.3-cli-bookworm

# 1. System Dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev \
    libonig-dev libxml2-dev pkg-config \
    libssl-dev ca-certificates openssl \
    libcurl4-openssl-dev \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. PHP Extensions
RUN docker-php-ext-install zip mbstring exif pcntl bcmath \
    && pecl install mongodb-1.17.0 \
    && docker-php-ext-enable mongodb

# 3. Raise PHP memory limit
RUN echo "memory_limit=-1" > /usr/local/etc/php/conf.d/memory.ini

# 4. Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 5. Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# 6. Copy full app
COPY . .

# 7. Set dummy env vars so Laravel doesn't crash during build
ENV APP_KEY="base64:DummyKeyForBuildOnly="
ENV MONGODB_URI="mongodb://localhost:27017"
ENV DB_CONNECTION="mongodb"
ENV MONGODB_DATABASE="blogsite"

# 8. Install PHP dependencies — skip scripts to prevent package:discover running
RUN COMPOSER_MEMORY_LIMIT=-1 composer install \
    --no-dev \
    --optimize-autoloader \
    --no-scripts \           
    --no-interaction \
    --prefer-dist \
    --ignore-platform-reqs

# 9. Manually run autoload dump without triggering artisan
RUN COMPOSER_MEMORY_LIMIT=-1 composer dump-autoload --optimize --no-scripts

# 10. Install Node dependencies & build frontend
RUN npm ci --legacy-peer-deps && npm run build

# 11. Permissions
RUN mkdir -p storage/logs storage/framework/cache \
    storage/framework/sessions storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www

EXPOSE 8000

# 12. Runtime — package:discover runs here with real env vars from Render
CMD ["sh", "-c", \
    "php artisan package:discover --ansi && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]