import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Resposta de atualização de receita",
})
export class UpdateRecipeResponseDto {
  @SchemaProperty({
    description: "ID único da receita atualizada",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @SchemaProperty({
    description: "Nome da receita atualizada",
    example: "Bolo de Chocolate com Cobertura Especial",
  })
  nome!: string;

  @SchemaProperty({
    description: "ID da categoria da receita",
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id_categorias!: string;

  @SchemaProperty({
    type: "number",
    description: "Tempo de preparo em minutos",
    example: 50,
  })
  tempo_preparo_minutos?: number;

  @SchemaProperty({
    type: "number",
    description: "Número de porções",
    example: 10,
  })
  porcoes?: number;

  @SchemaProperty({
    description: "Instruções de preparo",
    example: "1. Pré-aqueça o forno a 180°C. 2. Derreta o chocolate em banho-maria...",
  })
  modo_preparo!: string;

  @SchemaProperty({
    description: "Lista de ingredientes",
    example: "• 250g de chocolate meio amargo\n• 4 ovos grandes...",
  })
  ingredientes?: string;

  @SchemaProperty({
    description: "ID do usuário que criou a receita",
    format: "uuid",
    example: "e7932dd2-1873-42a7-8e49-3908758efa4c",
  })
  id_usuario!: string;

  @SchemaProperty({
    description: "Data de criação da receita",
    format: "date-time",
    example: "2025-01-27T10:30:00.000Z",
  })
  created_at!: string;

  @SchemaProperty({
    description: "Data da última atualização",
    format: "date-time",
    example: "2025-01-27T11:45:00.000Z",
  })
  updated_at!: string;
}
