# Dockerfile multi-stage para o projeto server
FROM node:24-alpine AS build

WORKDIR /app

# Copia arquivos necessários para instalar dependências e buildar
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY src ./src
# (adicione outros arquivos necessários para o build, se houver)

# Instala pnpm e dependências de desenvolvimento
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Faz o build do projeto
RUN pnpm build

# ---
# Imagem final, apenas com o dist
FROM node:24-alpine AS production
WORKDIR /app

# Copia o .env.example e renomeia para .env
COPY .env.example .env

# Copia apenas o dist gerado pelo build
COPY --from=build /app/dist ./dist

# Copia package.json e pnpm-lock.yaml para instalar dependências de produção
COPY package.json pnpm-lock.yaml ./

# Instala apenas dependências de produção
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Expõe a porta padrão (ajuste se necessário)
EXPOSE 3001

# Comando para rodar a aplicação
CMD ["node", "dist/main.js"]
