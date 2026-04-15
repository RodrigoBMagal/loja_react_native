# VetStock - Gerenciador de Estoque para Clínica Veterinária

Aplicativo React Native com backend Node.js + PostgreSQL para gerenciar estoque de produtos.

## 📋 Pré-requisitos

- Node.js (v16+)
- PostgreSQL (v12+)
- npm ou yarn

## 🚀 Instalação

### 1. Configurar Banco de Dados

```bash
# Criar banco de dados PostgreSQL
psql -U postgres
CREATE DATABASE vetstock;
\q
```

### 2. Configurar Backend

```bash
cd vetstock-backend

# Copiar arquivo de configuração
cp .env.example .env

# Atualizar .env com suas credenciais PostgreSQL
# DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/vetstock
# JWT_SECRET=sua_chave_secreta_aleatoria

# Instalar dependências
npm install
```

### 3. Configurar Frontend

```bash
cd ..

# Instalar dependências
npm install
```

### 4. Ajustar URL da API (se necessário)

Editar `src/services/api.js` e atualizar a variável `BASE_URL` com o IP do seu backend:

```javascript
const BASE_URL = 'http://seu_ip_local:3000';
```

## ▶️ Executar

### Backend (em um terminal)

```bash
cd vetstock-backend
npm start      # Produção
# ou
npm run dev    # Desenvolvimento com nodemon
```

### Frontend (em outro terminal)

```bash
npm start
```

Opções para o frontend:
- `npm start` - Expo web
- `npm run android` - Android
- `npm run ios` - iOS
- `npm run web` - Web

## 📁 Estrutura do Projeto

```
.
├── App.js                      # Configuração principal de navegação
├── PrimTela.js                 # Tela inicial
├── src/
│   ├── context/
│   │   └── StockContext.js     # Context global do estoque
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── ProductsScreen.js
│   │   ├── LowStockScreen.js
│   │   └── AddEditProductScreen.js
│   └── services/
│       └── api.js              # Cliente HTTP
└── vetstock-backend/
    ├── server.js               # Servidor Express
    ├── src/
    │   ├── db.js               # Conexão PostgreSQL
    │   ├── middleware/
    │   │   └── auth.js         # JWT authentication
    │   └── routes/
    │       ├── auth.js         # Endpoints de autenticação
    │       └── products.js     # Endpoints de produtos
    └── .env                    # Variáveis de ambiente
```

## 🔑 Endpoints da API

### Autenticação
- `POST /auth/login` - Login com username/password

### Produtos
- `GET /products` - Listar todos
- `POST /products` - Criar novo
- `PUT /products/:id` - Atualizar
- `PATCH /products/:id/quantity` - Atualizar quantidade
- `DELETE /products/:id` - Deletar

## ✅ Checklist de Inicialização

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `vetstock` criado
- [ ] `npm install` executado (frontend e backend)
- [ ] `.env` do backend configurado
- [ ] Backend iniciado (`npm start`)
- [ ] Frontend iniciado (`npm start`)

## 🐛 Troubleshooting

**Erro de conexão ao banco de dados**
- Verificar se PostgreSQL está rodando
- Validar credenciais em `.env`
- Confirmar que o banco `vetstock` existe

**Erro "Cannot connect to server"**
- Verificar se backend está rodando
- Atualizar IP em `src/services/api.js`

**Porta 3000 já em uso**
- Mudar PORT em `.env` para outra porta
- Ou: `lsof -ti:3000 | xargs kill -9` (Linux/Mac) ou `netstat -ano | findstr :3000` (Windows)
