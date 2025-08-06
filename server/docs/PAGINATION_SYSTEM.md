# Sistema de Paginação Elegante com Generics

## 📋 Resumo da Implementação

Sistema de paginação com generics que pode ser usado em **todos os módulos** da aplicação.

## 🏗️ Arquitetura Criada

### 1. **PaginatedData<T>** - Interface Genérica

```typescript
interface PaginatedData<T> {
  items: T[]; // Array de itens da página atual
  pagination: {
    currentPage: number; // Página atual (baseada em 1)
    itemsPerPage: number; // Itens por página
    totalItems: number; // Total de itens encontrados
    totalPages: number; // Total de páginas
    hasNextPage: boolean; // Tem próxima página?
    hasPreviousPage: boolean; // Tem página anterior?
  };
}
```

### 2. **PaginationParamsDto** - Validação de Query Parameters

```typescript
class PaginationParamsDto {
  page?: number = 1; // Página (min: 1)
  limit?: number = 10; // Limite (min: 1, max: 100)
  get offset(): number; // Calcula offset automaticamente
}
```

### 3. **ApiResponse.paginated()** - Método Elegante

```typescript
// Uso simples:
ApiResponse.paginated(items, page, limit, total, "Mensagem opcional");

// Retorna:
Promise<ApiResponse<PaginatedData<UserProfileDto>>>;
```

## 🚀 Como Usar nos Controllers

### Exemplo Prático - UsersController:

```typescript
@Get("/")
@RouteAccess(RouteAccessType.AUTHENTICATED)
async findAll(
  @Query(PaginationParamsDto) pagination: PaginationParamsDto
): Promise<ApiResponse<PaginatedData<UserProfileDto>>> {

  const { items, total } = await this.usersService.findAllPaginated(
    pagination.page!,
    pagination.limit!,
    pagination.offset
  );

  return ApiResponse.paginated(
    items,
    pagination.page!,
    pagination.limit!,
    total,
    "Lista de usuários retornada com sucesso"
  );
}
```

## 📡 Endpoints Disponíveis

### **GET /users/** - Lista Paginada de Usuários

- **Autenticação**: Obrigatória
- **Query Parameters**:
  - `page` (opcional): Número da página (padrão: 1)
  - `limit` (opcional): Itens por página (padrão: 10, máx: 100)

**Exemplo de Requisição:**

```bash
GET /api/users/?page=2&limit=5
Authorization: Bearer <seu-token>
```

**Resposta:**

```json
{
  "message": "Lista de usuários retornada com sucesso",
  "data": {
    "items": [
      {
        "id": "uuid-do-usuario",
        "nome": "João Silva",
        "email": "joao@email.com",
        "role": "DEFAULT",
        "criado_em": "2024-01-15T10:30:00.000Z",
        "alterado_em": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 2,
      "itemsPerPage": 5,
      "totalItems": 25,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": true
    }
  }
}
```

### **GET /users/me** - Dados do Usuário Autenticado

- **Autenticação**: Obrigatória
- **Usa**: Decorator `@CurrentUser()` elegante

## 🔧 Recursos Implementados

### ✅ **Decorators Elegantes**

- `@Query(PaginationParamsDto)` - Validação automática de query parameters
- `@CurrentUser()` - Acesso limpo ao usuário autenticado
- `@Param("id", UserIdDto)` - Validação de parâmetros de URL

### ✅ **Validação Automática**

- **Página**: Deve ser ≥ 1
- **Limite**: Entre 1 e 100 itens por página
- **Transformação**: String → Number automática

### ✅ **Extensibilidade**

- **Genérico**: Funciona com qualquer DTO (`UserProfileDto`, `CategoryDto`, etc.)
- **Reutilizável**: Mesmo padrão em todos os módulos
- **Consistente**: Sempre retorna a mesma estrutura

## 🎯 Benefícios da Implementação

1. **Type Safety**: Tipagem completa com TypeScript
2. **Validação Automática**: class-validator garante dados corretos
3. **Padronização**: Mesma estrutura em toda aplicação
4. **Performance**: Offset/Limit otimizado para MySQL
5. **DX (Developer Experience)**: Controllers limpos e elegantes

## 📝 Para Próximos Módulos

Para implementar paginação em outros módulos (categories, recipes), basta:

1. **No Repository**: Adicionar `findWithPagination()` e `count()`
2. **No Service**: Criar método `findAllPaginated()`
3. **No Controller**: Usar `@Query(PaginationParamsDto)` e `ApiResponse.paginated()`

### Exemplo para CategoriesController:

```typescript
@Get("/")
async findAll(
  @Query(PaginationParamsDto) pagination: PaginationParamsDto
): Promise<ApiResponse<PaginatedData<CategoryDto>>> {

  const { items, total } = await this.categoriesService.findAllPaginated(
    pagination.page!,
    pagination.limit!,
    pagination.offset
  );

  return ApiResponse.paginated(items, pagination.page!, pagination.limit!, total);
}
```

## 🎉 Conclusão

Sistema de paginação **elegante**, **type-safe** e **reutilizável** implementado com sucesso!

A arquitetura segue os padrões estabelecidos e pode ser facilmente replicada em todos os módulos da aplicação.
