FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev libonig-dev \
    libxml2-dev nodejs npm \
    && docker-php-ext-install pdo zip mbstring exif pcntl bcmath

RUN pecl install mongodb && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --optimize-autoloader

# ↓ Fix: add --legacy-peer-deps
RUN npm ci --legacy-peer-deps && npm run build

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

RUN chmod -R 775 storage bootstrap/cache

EXPOSE $PORT

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT