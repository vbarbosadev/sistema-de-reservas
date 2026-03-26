# Inventory System

Sistema de controle de estoque desenvolvido com Spring Boot, PostgreSQL e Docker.

## Tecnologias

- Java 17 + Spring Boot 3.4
- PostgreSQL 16
- Docker + Docker Compose
- Maven

---

## Rodando localmente (desenvolvimento)

```bash
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:8090`.

---

## Deploy em produção

### Pré-requisitos

- Docker e Docker Compose instalados no servidor
- Repositório clonado: `git clone https://github.com/vbarbosadev/sistema-de-reservas.git`

### Primeiro deploy

```bash
# Build da imagem e sobe todos os serviços
docker build -t inventory-system-app:latest .
docker-compose -f docker-compose.prod.yml up -d
```

### Atualizando para uma nova versão

Use o script de deploy para atualizar a aplicação **sem perder os dados do banco**:

```bash
# Deploy da versão mais recente da branch atual
./scripts/deploy.sh

# Deploy de uma versão específica (tag)
./scripts/deploy.sh v1.0.0
```

O script faz automaticamente:
1. Checkout do código na versão informada
2. Build da nova imagem Docker
3. Reinicia apenas o container da app (o banco de dados não é tocado)

### Verificar logs

```bash
docker logs -f inventory-app
```

---

## Releases e versionamento

As releases seguem [Semantic Versioning](https://semver.org/lang/pt-BR/):

| Tipo de mudança | Exemplo |
|---|---|
| Bug fix | `v1.0.1` |
| Nova funcionalidade | `v1.1.0` |
| Quebra de compatibilidade | `v2.0.0` |

### Criar uma nova release

```bash
./scripts/release.sh 1.0.0
```

O script cria a tag e pergunta se deseja fazer push. Ao subir a tag, o GitHub Actions compila o projeto e publica a release automaticamente com o `.jar` anexado.

Acompanhe as releases em: [github.com/vbarbosadev/sistema-de-reservas/releases](https://github.com/vbarbosadev/sistema-de-reservas/releases)

---

## Dados e persistência

Os dados do PostgreSQL ficam armazenados no volume Docker `postgres_data`.
Este volume **persiste entre deploys e reinicializações** dos containers.

> Para apagar os dados permanentemente (irreversível): `docker-compose down -v`
