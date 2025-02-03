#!/bin/sh
echo "Waiting for PostgreSQL to start..."

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
  sleep 1
done

echo "PostgreSQL started!"

exec "$@"
