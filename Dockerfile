FROM php:8.3-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev \
    libonig-dev libxml2-dev pkg-config libssl-dev \
    && apt-get clean

# PHP extensions
RUN docker-php-ext-install zip mbstring exif pcntl bcmath

# MongoDB PHP extension
RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

# Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

# Set dummy environment variables to pass Laravel config validation during build
ENV MONGODB_URI="mongodb://localhost:27017"
ENV APP_KEY="base64:DummyKeyForBuildOnly="

# PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Node dependencies & build
RUN npm ci --legacy-peer-deps && npm run build

# Storage permissions
RUN mkdir -p storage/logs \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

# Optimize and start the server
CMD php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan migrate --force \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}