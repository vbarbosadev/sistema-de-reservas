#!/bin/bash
# Load Docker images from .tar.gz files (run this on the target machine)
# Usage: ./scripts/load-images.sh

set -e

IMAGES_DIR="$(dirname "$0")/images"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "ERROR: images/ folder not found. Copy the .tar.gz files to scripts/images/ first."
  exit 1
fi

echo "==> Loading inventory-app image..."
docker load < "$IMAGES_DIR/inventory-app.tar.gz"

echo "==> Loading postgres image..."
docker load < "$IMAGES_DIR/postgres-16-alpine.tar.gz"

echo ""
echo "Images loaded successfully."
echo ""
echo "To start the project (fresh, no data):"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "To start with a database backup:"
echo "  ./scripts/import.sh scripts/backups/<backup_file.sql>"
