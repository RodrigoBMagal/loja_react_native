# VetStock - Gerenciador de Estoque para Clinica Veterinaria

Aplicativo React Native (Expo + TypeScript) com backend Express + TypeScript + Prisma (PostgreSQL) para gerenciar estoque de produtos.

## Stack

- App: React Native (Expo), TypeScript, React Navigation
- Backend: Node.js, Express, TypeScript, Prisma ORM, Zod (validacao), Swagger (documentacao)
- Banco de dados: PostgreSQL
- Infra: Docker Compose, CI com GitHub Actions

## Rodando com Docker Compose (recomendado)

Sobe o banco de dados PostgreSQL e o backend automaticamente (aplica as migrations do Prisma no primeiro start).

```bash
cp .env.example .env   # ajuste os valores se quiser
docker compose up --build
```

- API: http://localhost:3000
- Documentacao Swagger: http://localhost:3000/docs
- Healthcheck: http://localhost:3000/health

Para popular o banco com usuarios/produtos de teste:

```bash
docker compose exec backend npm run seed
```

Depois, rode o app React Native normalmente (veja abaixo) - ele consome a API em `http://localhost:3000`.

## Rodando sem Docker

### 1. Banco de dados

```bash
psql -U postgres
CREATE DATABASE vetstock;
\q
```

### 2. Backend

```bash
cd vetstock-backend
cp .env.example .env
# Atualize DATABASE_URL, JWT_SECRET, etc.

npm install
npx prisma migrate deploy   # cria as tabelas
npm run seed                # (opcional) dados de teste
npm run dev                 # desenvolvimento (tsx watch)
# ou
npm run build && npm start  # producao
```

A documentacao interativa da API fica em `http://localhost:3000/docs` (Swagger UI).

### 3. App (React Native / Expo)

```bash
cd ..
npm install
npm run typecheck   # checagem de tipos TypeScript
npm start
```

Opcoes: `npm start` (Expo Dev Tools), `npm run android`, `npm run ios`, `npm run web`.

Se o backend estiver em outra maquina, atualize `BASE_URL` em `src/services/api.ts`.

## Estrutura do Projeto

```
.
├── App.tsx                          # Configuracao principal de navegacao
├── src/
│   ├── context/StockContext.tsx     # Context global do estoque
│   ├── screens/                     # Telas (TypeScript)
│   ├── services/api.ts              # Cliente HTTP
│   └── types/                       # Tipos compartilhados (models, navegacao)
├── docker-compose.yml
└── vetstock-backend/
    ├── src/
    │   ├── app.ts / server.ts       # App Express + bootstrap
    │   ├── docs/swagger.ts          # Configuracao OpenAPI/Swagger
    │   ├── lib/prisma.ts            # Cliente Prisma
    │   ├── middleware/              # auth (JWT) e validate (Zod)
    │   ├── routes/                  # auth.ts, products.ts
    │   └── schemas/                 # Schemas Zod de entrada
    ├── prisma/
    │   ├── schema.prisma            # Modelos User e Product
    │   ├── migrations/              # Migrations SQL versionadas
    │   └── seed.ts
    └── Dockerfile
```

## Endpoints da API

### Autenticacao
- `POST /auth/login` - Login com username/password

### Produtos (requerem `Authorization: Bearer <token>`)
- `GET /products` - Listar todos
- `POST /products` - Criar novo
- `PUT /products/:id` - Atualizar
- `PATCH /products/:id/quantity` - Ajustar quantidade (`{ delta }`)
- `DELETE /products/:id` - Deletar

Todos os endpoints, schemas de request/response e codigos de erro estao documentados em `/docs` (Swagger UI) quando o backend esta rodando.

## CI

O workflow `.github/workflows/ci.yml` roda em toda `push`/`pull_request` para `master`/`main`:
- **backend**: instala dependencias, gera o Prisma Client, faz type-check (`tsc --noEmit`), build (`tsc`) e aplica as migrations contra um Postgres de servico.
- **frontend**: instala dependencias e faz type-check do app React Native.

## Troubleshooting

**Erro de conexao ao banco de dados**
- Verificar se PostgreSQL esta rodando (ou `docker compose ps`)
- Validar `DATABASE_URL` em `.env`
- Rodar `npx prisma migrate deploy` (fora do Docker) para garantir que as tabelas existem

**Erro "Cannot connect to server" no app**
- Verificar se o backend esta rodando (`GET /health`)
- Atualizar `BASE_URL` em `src/services/api.ts`

**Porta 3000 ja em uso**
- Mudar `PORT`/`BACKEND_PORT` no `.env`
- Ou: `lsof -ti:3000 | xargs kill -9` (Linux/Mac) ou `netstat -ano | findstr :3000` (Windows)
