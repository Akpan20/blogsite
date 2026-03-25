FROM php:8.3-cli

# System dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev \
    libonig-dev libxml2-dev \
    && apt-get clean

# PHP extensions
RUN docker-php-ext-install pdo zip mbstring exif pcntl bcmath

# Node.js 20 (avoid using the outdated apt nodejs)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy files
COPY . .

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

CMD php artisan config:clear \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan migrate --force \
    && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}

