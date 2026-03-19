# Docker — Inventory System

Guia completo para rodar, exportar, importar e migrar o projeto usando Docker.

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- Bash disponível (Git Bash no Windows, Terminal no Linux/Mac)

Não é necessário ter Java, Maven ou PostgreSQL instalados localmente.

---

## Estrutura dos arquivos Docker

```
inventory-system/
├── Dockerfile                  # Build da aplicação Spring Boot (multi-stage)
├── .dockerignore               # Arquivos ignorados no build
├── docker-compose.yml          # Ambiente de desenvolvimento (faz o build)
├── docker-compose.prod.yml     # Ambiente de produção (usa imagem pronta)
└── scripts/
    ├── export.sh               # Exporta o banco e derruba os containers
    ├── import.sh               # Sobe o banco, importa dados e inicia o app
    ├── save-images.sh          # Empacota as imagens Docker em .tar.gz
    └── load-images.sh          # Carrega as imagens em outro ambiente
```

---

## 1. Subir o projeto pela primeira vez

```bash
cd inventory-system
docker compose up -d
```

O Docker vai:
1. Fazer o build da imagem da aplicação com Maven (pode demorar na primeira vez)
2. Subir o banco PostgreSQL
3. Aguardar o banco ficar pronto
4. Subir a aplicação Spring Boot

Acesse em: **http://localhost:8090**

Para acompanhar os logs em tempo real:
```bash
docker compose logs -f
```

Para parar (sem apagar os dados):
```bash
docker compose down
```

---

## 2. Exportar os dados e derrubar o projeto

Use este script quando quiser fazer um backup do banco antes de parar o ambiente.

```bash
./scripts/export.sh
```

O script:
1. Verifica se os containers estão rodando
2. Exporta todos os dados do banco para um arquivo `.sql` em `scripts/backups/`
3. Derruba todos os containers

O arquivo de backup terá o nome no formato: `inventory_YYYYMMDD_HHMMSS.sql`

---

## 3. Subir o projeto com dados importados

```bash
./scripts/import.sh scripts/backups/inventory_20260319_143000.sql
```

Substitua o nome do arquivo pelo backup que deseja restaurar.

O script:
1. Sobe apenas o container do banco
2. Aguarda o banco ficar pronto
3. Importa os dados do arquivo `.sql`
4. Sobe o container da aplicação

Acesse em: **http://localhost:8090**

Para listar os backups disponíveis:
```bash
./scripts/import.sh
```

---

## 4. Migrar para outro PC (sem o código-fonte)

É possível levar o projeto para outro PC carregando apenas as imagens Docker e os scripts, sem precisar do código-fonte, Java ou Maven.

### 4.1 No PC atual — empacotar as imagens

```bash
./scripts/save-images.sh
```

Isso gera dois arquivos em `scripts/images/`:
- `inventory-app.tar.gz` — imagem da aplicação Spring Boot
- `postgres-16-alpine.tar.gz` — imagem do banco de dados

Se quiser levar os dados do banco junto, exporte antes:
```bash
./scripts/export.sh
```

### 4.2 Copiar os seguintes arquivos para o outro PC

```
docker-compose.prod.yml
scripts/load-images.sh
scripts/import.sh
scripts/images/inventory-app.tar.gz
scripts/images/postgres-16-alpine.tar.gz
scripts/backups/<arquivo.sql>          ← apenas se quiser levar os dados
```

### 4.3 No outro PC — carregar as imagens

```bash
./scripts/load-images.sh
```

### 4.4 No outro PC — subir o projeto

**Sem dados (banco vazio):**
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Com dados importados:**
```bash
./scripts/import.sh scripts/backups/inventory_20260319_143000.sql
```

> O outro PC precisa apenas do **Docker instalado**. Não precisa de Java, Maven ou PostgreSQL.

---

## Referência rápida

| Ação | Comando |
|---|---|
| Subir o projeto | `docker compose up -d` |
| Derrubar o projeto | `docker compose down` |
| Ver logs | `docker compose logs -f` |
| Ver logs só do app | `docker compose logs -f app` |
| Exportar banco + derrubar | `./scripts/export.sh` |
| Subir com dados importados | `./scripts/import.sh <arquivo.sql>` |
| Empacotar imagens para transferência | `./scripts/save-images.sh` |
| Carregar imagens no outro PC | `./scripts/load-images.sh` |
| Acessar o banco direto | `docker exec -it inventory-db psql -U admin -d inventory` |

---

## Portas utilizadas

| Serviço | Porta |
|---|---|
| Aplicação | 8090 |
| PostgreSQL | 5432 |
