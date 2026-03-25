FROM php:8.3-cli

# Install system dependencies including MongoDB driver dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libzip-dev libpng-dev libonig-dev \
    libxml2-dev nodejs npm \
    && docker-php-ext-install pdo zip mbstring exif pcntl bcmath

# Install MongoDB PHP extension
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies (make sure your composer.json requires mongodb/laravel-mongodb)
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies & build frontend
RUN npm ci && npm run build

# (No SQLite setup needed)

# Laravel caches
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Permissions (only needed if you have storage/logs etc.)
RUN chmod -R 775 storage bootstrap/cache

EXPOSE $PORT

# Migrate using MongoDB (adjust if your migrations work differently)
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT