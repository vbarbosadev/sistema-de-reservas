#!/bin/bash
# Import database data and start the project
# Usage: ./scripts/import.sh <backup_file.sql>

set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/import.sh <backup_file.sql>"
  echo ""
  echo "Available backups:"
  ls "$(dirname "$0")/backups/" 2>/dev/null || echo "  No backups found."
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: File not found: $BACKUP_FILE"
  exit 1
fi

PROJECT_DIR="$(dirname "$0")/.."

# Detect which compose file to use
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
  COMPOSE_FILE="docker-compose.yml"
elif [ -f "$PROJECT_DIR/docker-compose.prod.yml" ]; then
  COMPOSE_FILE="docker-compose.prod.yml"
else
  echo "ERROR: No docker-compose.yml or docker-compose.prod.yml found in $PROJECT_DIR"
  exit 1
fi

echo "==> Using $COMPOSE_FILE"

echo "==> Starting database container..."
cd "$PROJECT_DIR" && docker compose -f "$COMPOSE_FILE" up -d db

echo "==> Waiting for database to be ready..."
until docker exec inventory-db pg_isready -U admin -d inventory > /dev/null 2>&1; do
  echo "   Waiting..."
  sleep 2
done

echo "==> Importing data from $BACKUP_FILE ..."
docker exec -i inventory-db psql -U admin -d inventory < "$BACKUP_FILE"

echo "==> Data imported. Starting application..."
cd "$PROJECT_DIR" && docker compose -f "$COMPOSE_FILE" up -d app

echo ""
echo "Done. Application available at http://localhost:8090"
