# Wait for postgres to startup and have the required database for local development.

RETRIES=15

until docker compose exec -T postgres psql -U postgres -d devdb -c 'select 1;' > /dev/null 2>&1 || [ $RETRIES -eq 0 ]
do
  echo "Waiting for database to initialize, $RETRIES remaining attempts..."
  RETRIES=$((RETRIES-=1))
  sleep 0.3
done
