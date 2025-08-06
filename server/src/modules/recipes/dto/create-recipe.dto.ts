import { IsString, IsNotEmpty, IsOptional, IsInt, IsPositive, IsUUID } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados para criação de uma nova receita",
})
export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty({ message: "Nome da receita é obrigatório" })
  @SchemaProperty({
    description: "Nome da receita",
    example: "Bolo de Chocolate com Cobertura",
    minLength: 1,
  })
  nome!: string;

  @IsUUID("all", { message: "ID da categoria deve ser um UUID válido" })
  @IsNotEmpty({ message: "ID da categoria é obrigatório" })
  @SchemaProperty({
    description: "ID da categoria da receita (obrigatório) - Use o endpoint GET /categories para obter IDs válidos",
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id_categorias!: string;

  @IsInt({ message: "Tempo de preparo deve ser um número inteiro" })
  @IsPositive({ message: "Tempo de preparo deve ser positivo" })
  @IsOptional()
  @SchemaProperty({
    type: "number",
    description: "Tempo de preparo em minutos (opcional)",
    example: 45,
    minimum: 1,
  })
  tempo_preparo_minutos?: number;

  @IsInt({ message: "Número de porções deve ser um número inteiro" })
  @IsPositive({ message: "Número de porções deve ser positivo" })
  @IsOptional()
  @SchemaProperty({
    type: "number",
    description: "Número de porções que a receita rende (opcional)",
    example: 8,
    minimum: 1,
  })
  porcoes?: number;

  @IsString()
  @IsNotEmpty({ message: "Modo de preparo é obrigatório" })
  @SchemaProperty({
    description: "Instruções detalhadas de como preparar a receita",
    example:
      "1. Pré-aqueça o forno a 180°C. 2. Em uma tigela, misture os ingredientes secos. 3. Em outra tigela, bata os ovos com açúcar até ficar cremoso. 4. Derreta o chocolate e misture com a manteiga. 5. Combine todos os ingredientes e misture bem. 6. Despeje na forma untada e asse por 35-40 minutos.",
    minLength: 10,
  })
  modo_preparo!: string;

  @IsString()
  @IsOptional()
  @SchemaProperty({
    description: "Lista detalhada de ingredientes necessários (opcional)",
    example:
      "• 200g de chocolate meio amargo\n• 3 ovos\n• 1 xícara (200g) de açúcar\n• 1/2 xícara (100g) de manteiga\n• 1 xícara (120g) de farinha de trigo\n• 1 colher (chá) de fermento em pó\n• 1 pitada de sal\n• 1/2 xícara de leite",
  })
  ingredientes?: string;
}
