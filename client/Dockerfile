# Stage 1: Build
FROM node:24-alpine as build-stage

# Instalar pnpm globalmente
RUN npm install -g pnpm@latest

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install

# Copiar código fonte
COPY . .

# Copiar arquivo de environment para produção
COPY .env.production .env

# Build da aplicação
RUN pnpm build

# Stage 2: Production
FROM nginx:alpine as production-stage

# Copiar arquivos buildados para o nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta 80
EXPOSE 80

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]
