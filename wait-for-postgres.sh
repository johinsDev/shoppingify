#!/bin/sh
# wait-for-postgres.sh
>&2 echo "Checking postgres..."

echo $DB_PASSWORD
echo $DB_USER
echo $DB_NAME
echo $DB_HOST
echo $DB_PORT

until PGPASSWORD=$DB_PASSWORD PGUSER=$DB_USER PGHOST=$DB_HOST PGDATABASE=$DB_NAME psql -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done
>&2 echo "Postgres is up..."
exec "$@"
