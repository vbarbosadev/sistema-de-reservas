#!/bin/bash
# Build and save Docker images to .tar files for transfer to another machine
# Usage: ./scripts/save-images.sh

set -e

OUTPUT_DIR="$(dirname "$0")/images"
mkdir -p "$OUTPUT_DIR"

echo "==> Building application image..."
cd "$(dirname "$0")/.." && docker compose build

echo "==> Pulling postgres image (if not present)..."
docker pull postgres:16-alpine

echo "==> Saving inventory-app image..."
docker save inventory-system-app:latest | gzip > "$OUTPUT_DIR/inventory-app.tar.gz"

echo "==> Saving postgres image..."
docker save postgres:16-alpine | gzip > "$OUTPUT_DIR/postgres-16-alpine.tar.gz"

echo ""
echo "Done. Files saved in $OUTPUT_DIR/"
echo ""
echo "To transfer to another machine, copy:"
echo "  - scripts/images/inventory-app.tar.gz"
echo "  - scripts/images/postgres-16-alpine.tar.gz"
echo "  - docker-compose.prod.yml"
echo "  - scripts/import.sh"
echo ""
echo "On the target machine, run:"
echo "  ./scripts/load-images.sh"
echo "  docker compose -f docker-compose.prod.yml up -d"
