# Decorator @Param - Sistema Similar ao NestJS

## 📖 **Visão Geral**

O decorator `@Param` permite injetar e validar parâmetros de URL de forma elegante, similar ao NestJS, mantendo o controller limpo e com validação automática.

## 🚀 **Como Usar**

### **Uso Básico (sem validação)**

```typescript
import { Param } from "../../common/decorators";

@Post("/logout/:id")
async logout(@Param("id") id: string): Promise<ApiResponse<boolean>> {
  // id contém o valor do parâmetro da URL
  console.log(id); // "123e4567-e89b-12d3-a456-426614174000"
}
```

### **Uso Avançado (com validação DTO)**

```typescript
import { Param } from "../../common/decorators";
import { LogoutParamDto } from "./dto";

@Post("/logout/:id")
async logout(@Param("id", LogoutParamDto) id: string): Promise<ApiResponse<boolean>> {
  // id já vem validado como UUID pelo LogoutParamDto
  // Se inválido, lança ValidationException automaticamente
}
```

### **Múltiplos Parâmetros**

```typescript
@Put("/users/:userId/posts/:postId")
async updatePost(
  @Param("userId", UserIdDto) userId: string,
  @Param("postId", PostIdDto) postId: string,
  updateDto: UpdatePostDto
): Promise<ApiResponse<Post>> {
  // Ambos parâmetros validados automaticamente
}
```

## 🔧 **Criando DTOs para Validação**

### **Exemplo: LogoutParamDto**

```typescript
import { IsUUID } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "DTO para validação de parâmetro ID do usuário.",
})
export class LogoutParamDto {
  @IsUUID(4, { message: "ID do usuário deve ser um UUID válido" })
  @SchemaProperty({
    description: "ID único do usuário",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;
}
```

## ⚙️ **Como Funciona Internamente**

1. **Metadata**: Decorator armazena metadados sobre parâmetros
2. **Extração**: Sistema de rotas extrai parâmetros da URL
3. **Validação**: Se DTO fornecido, valida com `class-validator`
4. **Injeção**: Parâmetro validado é injetado no método

## 🔄 **Migração do Método Antigo**

### **Antes:**

```typescript
async logout(params: { id: string }): Promise<ApiResponse<boolean>> {
  // Validação manual
  const validatedDto = await ParamValidator.validate(
    { userId: params.id },
    UserIdDto
  );
  const result = await this.authService.logout(validatedDto);
  return ApiResponse.success(result, "Logout realizado com sucesso");
}
```

### **Depois:**

```typescript
async logout(@Param("id", LogoutParamDto) id: string): Promise<ApiResponse<boolean>> {
  // Validação automática! ✨
  const userIdDto: UserIdDto = { userId: id };
  const result = await this.authService.logout(userIdDto);
  return ApiResponse.success(result, "Logout realizado com sucesso");
}
```

## 🎯 **Vantagens**

- ✅ **Sintaxe Limpa**: Similar ao NestJS
- ✅ **Validação Automática**: Usando `class-validator`
- ✅ **Type Safety**: Tipagem forte do TypeScript
- ✅ **Reutilizável**: DTOs podem ser reutilizados
- ✅ **Backward Compatible**: Funciona com método antigo

## 🔍 **Tratamento de Erros**

Se validação falhar, é lançada uma `ValidationException` automaticamente:

```json
{
  "success": false,
  "code": 400,
  "message": "ID do usuário deve ser um UUID válido",
  "data": null
}
```

## 🛠️ **Implementação Técnica**

### **Estrutura de Arquivos**

```
src/
├── common/
│   ├── decorators/
│   │   ├── param.decorator.ts      # Decorator @Param
│   │   └── index.ts                # Export do decorator
│   └── validators/
│       ├── param-validator.ts      # Helper de validação (legacy)
│       └── index.ts
└── modules/
    └── auth/
        ├── dto/
        │   ├── logout-param.dto.ts # DTO para validação
        │   └── index.ts
        └── auth.controller.ts      # Uso do decorator
```

### **Metadados Armazenados**

```typescript
interface ParamMetadata {
  index: number; // Posição do parâmetro no método
  paramName: string; // Nome do parâmetro na URL (:id)
  dtoClass?: new () => any; // Classe DTO para validação
}
```

## 🔄 **Compatibilidade**

### **Método Antigo (ainda funciona)**

```typescript
// ✅ Continua funcionando para controllers sem @Param
async findById(params: { id: string }): Promise<ApiResponse<User>> {
  return ApiResponse.success({ id: params.id }, "Usuário encontrado");
}
```

### **Método Novo (recomendado)**

```typescript
// ✨ Nova forma elegante com validação
async findById(@Param("id", UserIdDto) id: string): Promise<ApiResponse<User>> {
  return ApiResponse.success({ id }, "Usuário encontrado");
}
```

## 📝 **Exemplos Práticos**

### **1. Usuários Controller**

```typescript
@Controller("/users")
export class UsersController {
  @Get("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async findById(
    @Param("id", UserIdDto) id: string
  ): Promise<ApiResponse<User>> {
    const user = await this.usersService.findById(id);
    return ApiResponse.success(user, "Usuário encontrado");
  }

  @Put("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async update(
    @Param("id", UserIdDto) id: string,
    updateDto: UpdateUserDto
  ): Promise<ApiResponse<User>> {
    const user = await this.usersService.update(id, updateDto);
    return ApiResponse.success(user, "Usuário atualizado");
  }

  @Delete("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async delete(@Param("id", UserIdDto) id: string): Promise<ApiResponse<void>> {
    await this.usersService.delete(id);
    return ApiResponse.success(undefined, "Usuário excluído");
  }
}
```

### **2. Receitas Controller**

```typescript
@Controller("/recipes")
export class RecipesController {
  @Get("/:id")
  @RouteAccess(RouteAccessType.PUBLIC)
  async findById(
    @Param("id", RecipeIdDto) id: string
  ): Promise<ApiResponse<Recipe>> {
    const recipe = await this.recipesService.findById(id);
    return ApiResponse.success(recipe, "Receita encontrada");
  }

  @Put("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async update(
    @Param("id", RecipeIdDto) id: string,
    updateDto: UpdateRecipeDto
  ): Promise<ApiResponse<Recipe>> {
    const recipe = await this.recipesService.update(id, updateDto);
    return ApiResponse.success(recipe, "Receita atualizada");
  }
}
```

### **3. Rotas Aninhadas**

```typescript
@Controller("/users")
export class UsersController {
  @Get("/:userId/recipes/:recipeId")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async getUserRecipe(
    @Param("userId", UserIdDto) userId: string,
    @Param("recipeId", RecipeIdDto) recipeId: string
  ): Promise<ApiResponse<Recipe>> {
    const recipe = await this.recipesService.findByUserAndId(userId, recipeId);
    return ApiResponse.success(recipe, "Receita do usuário encontrada");
  }
}
```

## 🎯 **Melhores Práticas**

### **1. Naming Convention**

```typescript
// ✅ Use nomes descritivos para DTOs
LogoutParamDto     // Para parâmetros de logout
UserIdDto          // Para IDs de usuário
RecipeIdDto        // Para IDs de receita

// ✅ Mantenha consistência nos nomes dos parâmetros
@Param("id")           // Para recursos simples
@Param("userId")       // Para IDs específicos
@Param("recipeId")     // Para recursos relacionados
```

### **2. Validações Específicas**

```typescript
// ✅ DTOs específicos para diferentes contextos
export class UserIdDto {
  @IsUUID(4, { message: "ID do usuário deve ser um UUID válido" })
  id!: string;
}

export class RecipeIdDto {
  @IsUUID(4, { message: "ID da receita deve ser um UUID válido" })
  @IsNotEmpty({ message: "ID da receita é obrigatório" })
  id!: string;
}
```

### **3. Error Handling**

```typescript
// ✅ Mensagens de erro claras e específicas
@IsUUID(4, { message: "ID do usuário deve ser um UUID v4 válido" })
@IsNotEmpty({ message: "ID do usuário não pode estar vazio" })
```

## 🚀 **Próximos Passos**

### **1. Extensões Possíveis**

- `@Query()` - Para query parameters
- `@Body()` - Para request body (já existe implicitamente)
- `@Headers()` - Para headers customizados

### **2. Decorators Adicionais**

```typescript
// Futuras implementações
@Get("/search")
async search(
  @Query("name", SearchQueryDto) name?: string,
  @Query("page", PageQueryDto) page: number = 1
): Promise<ApiResponse<Recipe[]>> {
  // Query parameters validados
}
```

## 🏁 **Conclusão**

O decorator `@Param` traz elegância e robustez ao sistema de rotas, mantendo compatibilidade com o código existente enquanto oferece uma API moderna similar ao NestJS.

**Principais benefícios:**

- 🎯 **Sintaxe limpa** e familiar
- 🛡️ **Validação automática** com DTOs
- 🔄 **Backward compatibility**
- 📖 **Documentação automática** no Swagger
- ⚡ **Performance** otimizada

Este sistema eleva o projeto para um novo nível de qualidade e manutenibilidade! 🚀
