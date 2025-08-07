# 🍳 ChefiBook - Sistema de Receitas

Sistema de gerenciamento de receitas com autenticação, categorias e interface moderna feito para ser executado com docker compose.

## Tecnologias

### Backend

- **FastifyJS** - Framework web rápido e eficiente
- **TypeScript** - Tipagem estática
- **MariaDB** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Swagger** - Documentação automática da API

### Frontend

- **Vue 3** - Framework progressivo
- **Vuetify 3** - Biblioteca de componentes Material Design
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderno

### Infraestrutura

- **Docker** - Containerização
- **Nginx** - Servidor web
- **Docker Compose** - Orquestração de containers

## Estrutura do Projeto

```
test-4apm/
├── client/          # Frontend Vue.js
├── server/          # Backend FastifyJS
├── database/        # Scripts SQL
└── docker-compose.yml
```

## Instalação e Execução

### Usando Docker (Recomendado)

1. **Clone o repositório**

```bash
git clone <repository-url>
cd test-4apm
```

2. **Execute com Docker Compose**

```bash
docker-compose up -d
```

3. **Acesse a aplicação**

- **Frontend**: http://localhost:9000
- **API**: http://localhost:9001/api/docs
- **Database**: localhost:9002