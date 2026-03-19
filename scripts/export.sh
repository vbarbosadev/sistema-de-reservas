#!/bin/bash
# Export all database data and bring down the project
# Usage: ./scripts/export.sh

set -e

BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/inventory_$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "==> Checking if containers are running..."
if ! docker ps --format '{{.Names}}' | grep -q "inventory-db"; then
  echo "ERROR: inventory-db container is not running. Start with: docker compose up -d"
  exit 1
fi

echo "==> Exporting database to $BACKUP_FILE ..."
docker exec inventory-db pg_dump \
  -U admin \
  -d inventory \
  --no-owner \
  --no-acl \
  -F p \
  > "$BACKUP_FILE"

echo "==> Export complete: $BACKUP_FILE"
echo ""
echo "==> Bringing down containers..."
cd "$(dirname "$0")/.." && docker compose down

echo ""
echo "Done. To restore in another environment, run:"
echo "  ./scripts/import.sh $BACKUP_FILE"
