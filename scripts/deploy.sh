#!/bin/bash
# Deploy script — atualiza a aplicação sem perder os dados do banco
# Usage: ./scripts/deploy.sh [versao]
# Example: ./scripts/deploy.sh v1.0.0   (deploy de uma tag específica)
#          ./scripts/deploy.sh           (deploy da branch atual)

set -e

VERSION=$1
COMPOSE_FILE="docker-compose.prod.yml"
IMAGE_NAME="inventory-system-app"

echo "==> Iniciando deploy do Inventory System..."

# Vai para o diretório raiz do projeto
cd "$(dirname "$0")/.."

# Faz checkout de uma versão específica se informada
if [ -n "$VERSION" ]; then
  echo "==> Fazendo checkout da versão $VERSION..."
  git fetch --tags
  git checkout "$VERSION"
else
  echo "==> Atualizando branch atual..."
  git pull
fi

# Build da imagem Docker
echo "==> Buildando imagem Docker..."
docker build -t "$IMAGE_NAME:latest" .

# Reinicia apenas o container da app (banco e dados intactos)
echo "==> Reiniciando container da aplicação..."
docker-compose -f "$COMPOSE_FILE" up -d --no-deps app

echo ""
echo "==> Deploy concluído!"
echo "    Aplicação rodando em: http://localhost:8090"
echo "    Logs: docker logs -f inventory-app"
