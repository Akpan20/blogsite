FROM php:8.3-cli-bookworm

# System dependencies - include ca-certificates and update them
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev \
    libonig-dev libxml2-dev pkg-config \
    libssl-dev ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

# Update CA certificates separately to ensure latest
RUN update-ca-certificates --fresh

# PHP extensions
RUN docker-php-ext-install zip mbstring exif pcntl bcmath

# MongoDB PHP extension with specific version
RUN pecl install mongodb-1.17.0 \
    && docker-php-ext-enable mongodb

# Verify MongoDB extension loaded
RUN php -m | grep mongodb

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Build-time env vars (won't affect runtime)
ENV APP_KEY="base64:DummyKeyForBuildOnly="

RUN composer install --no-dev --optimize-autoloader
RUN npm ci --legacy-peer-deps && npm run build

RUN mkdir -p storage/logs storage/framework/cache \
    storage/framework/sessions storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

# Use shell form to allow variable expansion
CMD sh -c "php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"