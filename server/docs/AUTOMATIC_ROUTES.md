# Sistema de Rotas Automáticas

Este projeto agora possui um sistema de geração automática de rotas baseado em decorators. As rotas são criadas automaticamente baseadas nos métodos dos controllers.

## Como Usar

### 1. Decorators de Rota

Use os decorators de rota para definir os endpoints:

```typescript
import { Controller, Get, Post, Put, Delete } from "../../common/decorators";

@Controller("/users") // Define o prefixo do controller
export class UsersController {

  @Get("/")  // GET /api/users/
  async findAll() { ... }

  @Get("/:id")  // GET /api/users/:id
  async findById(params: { id: string }) { ... }

  @Post("/")  // POST /api/users/
  async create(userDto: CreateUserDto) { ... }

  @Put("/:id")  // PUT /api/users/:id
  async update(params: { id: string }, userDto: UpdateUserDto) { ... }

  @Delete("/:id")  // DELETE /api/users/:id
  async delete(params: { id: string }) { ... }
}
```

### 2. Controle de Acesso

Use os decorators de acesso para controlar a autenticação e autorização:

```typescript
import { RouteAccess, AccessTo, RouteAccessType } from "../auth/decorators/access.decorators";
import { UserRole } from "../users/entities/user.entity";

@RouteAccess(RouteAccessType.PUBLIC)  // Rota pública (sem autenticação)
async login() { ... }

@RouteAccess(RouteAccessType.AUTHENTICATED)  // Requer autenticação
async getProfile() { ... }

@RouteAccess(RouteAccessType.AUTHENTICATED)
@AccessTo(UserRole.ADMIN)  // Requer autenticação + role ADMIN
async deleteUser() { ... }

@AccessTo(UserRole.ADMIN, UserRole.MODERATOR)  // Múltiplos roles permitidos
async moderateContent() { ... }
```

### 3. Parâmetros dos Métodos

O sistema automaticamente extrai e passa os parâmetros corretos:

```typescript
// Para métodos GET com parâmetros na URL
@Get("/:id")
async findById(params: { id: string }) {
  // params.id contém o valor do parâmetro da URL
}

// Para métodos GET com query parameters
@Get("/search")
async search(query: { name?: string, page?: number }) {
  // query contém os query parameters
}

// Para métodos POST/PUT/PATCH com body
@Post("/")
async create(createDto: CreateUserDto) {
  // createDto contém o body da requisição
}

// Para métodos com parâmetros na URL E body
@Put("/:id")
async update(params: { id: string }, updateDto: UpdateUserDto) {
  // params contém os parâmetros da URL
  // updateDto contém o body da requisição
}
```

### 4. Respostas da API

Use a classe `ApiResponse` para respostas padronizadas:

```typescript
import { ApiResponse } from "../../common/responses";

@Get("/")
async findAll(): Promise<ApiResponse<User[]>> {
  const users = await this.usersService.findAll();
  return ApiResponse.success(users, "Usuários listados com sucesso");
}

@Post("/")
async create(userDto: CreateUserDto): Promise<ApiResponse<User>> {
  const user = await this.usersService.create(userDto);
  return ApiResponse.created(user, "Usuário criado com sucesso");
}
```

### Controller de Usuários

```typescript
@Controller("/users")
export class UsersController {
	@Get("/")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	@AccessTo(UserRole.ADMIN)
	async findAll() {
		// GET /api/users/ - Apenas ADMINs
	}

	@Get("/:id")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	async findById(params: { id: string }) {
		// GET /api/users/:id - Usuários autenticados
	}

	@Put("/:id")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	async update(params: { id: string }, userDto: UpdateUserDto) {
		// PUT /api/users/:id - Usuários autenticados
	}
}
```

### Controller de Categorias

```typescript
@Controller("/categories")
export class CategoriesController {
	@Get("/")
	@RouteAccess(RouteAccessType.PUBLIC)
	async findAll() {
		// GET /api/categories/ - Público
	}

	@Post("/")
	@RouteAccess(RouteAccessType.AUTHENTICATED)
	@AccessTo(UserRole.ADMIN)
	async create(categoryDto: CreateCategoryDto) {
		// POST /api/categories/ - Apenas ADMINs
	}
}
```

## Funcionalidades

✅ **Geração Automática de Rotas**: Basta adicionar os decorators e as rotas são criadas automaticamente

✅ **Controle de Acesso**: Sistema completo de autenticação e autorização baseado em roles

✅ **Extração Automática de Parâmetros**: O sistema automaticamente extrai parâmetros da URL, query parameters e body

✅ **Logging Automático**: Todas as rotas registradas são logadas no console durante a inicialização

✅ **Respostas Padronizadas**: Uso da classe ApiResponse para respostas consistentes

✅ **Validação de Token JWT**: Integração automática com o middleware de autenticação

✅ **Tratamento de Erros**: Sistema robusto de tratamento de erros

## Como Funciona

1. **Inicialização**: O `routes.service.ts` é chamado durante a inicialização do Fastify
2. **Descoberta**: O sistema verifica todos os controllers registrados no container IoC
3. **Metadados**: Extrai os metadados dos decorators usando Reflect API
4. **Registro**: Registra automaticamente todas as rotas no Fastify
5. **Middleware**: Adiciona automaticamente middleware de autenticação/autorização quando necessário

## Adicionando Novos Controllers

1. Crie o controller com os decorators apropriados
2. Registre o controller no `container.ts`
3. Adicione o tipo no `TYPES` em `types.ts`
4. O sistema automaticamente detectará e registrará as rotas!

Não é mais necessário registrar rotas manualmente. O sistema faz tudo automaticamente baseado nos decorators!
