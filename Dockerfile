FROM php:8.3-cli-bookworm

# 1. System Dependencies & Optimized Cleanup
# Added libcurl4-openssl-dev to ensure the MongoDB driver has full TLS support
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev \
    libonig-dev libxml2-dev pkg-config \
    libssl-dev ca-certificates openssl \
    libcurl4-openssl-dev libsqlite3-dev \
    && update-ca-certificates --fresh \
    && rm -rf /var/lib/apt/lists/*

# 2. PHP Extensions
RUN docker-php-ext-install zip mbstring exif pcntl bcmath \
    && pecl install mongodb-1.17.0 \
    && docker-php-ext-enable mongodb

# 3. Node.js 20 Setup
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 4. Composer & Working Dir
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www

# 5. Layer Caching for Dependencies 
# We copy ONLY the dependency files first. This way, 'composer install' 
# and 'npm ci' only run again if your requirements change, not your code.
COPY composer.json composer.lock package.json package-lock.json ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction
RUN npm ci --legacy-peer-deps

# 6. Copy Application Code & Build Assets
COPY . .
ENV APP_KEY="base64:DummyKeyForBuildOnly="
RUN npm run build

# 7. Permissions & Directory Cleanup
RUN mkdir -p storage/logs storage/framework/cache \
    storage/framework/sessions storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chown -R www-data:www-data /var/www

EXPOSE 8000

# 8. Runtime Commands
# Using 'php artisan serve' for CLI environments
CMD ["sh", "-c", "php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]