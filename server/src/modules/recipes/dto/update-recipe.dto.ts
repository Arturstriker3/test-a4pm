import { IsString, IsOptional, IsInt, IsPositive, IsUUID } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados para atualização de uma receita existente",
})
export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  @SchemaProperty({
    description: "Nome da receita",
    example: "Bolo de Chocolate com Cobertura Especial",
    minLength: 1,
  })
  nome?: string;

  @IsUUID("all", { message: "ID da categoria deve ser um UUID válido" })
  @IsOptional()
  @SchemaProperty({
    description: "ID da categoria da receita - Use o endpoint GET /categories para obter IDs válidos",
    format: "uuid",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id_categorias?: string;

  @IsInt({ message: "Tempo de preparo deve ser um número inteiro" })
  @IsPositive({ message: "Tempo de preparo deve ser positivo" })
  @IsOptional()
  @SchemaProperty({
    type: "number",
    description: "Tempo de preparo em minutos",
    example: 50,
    minimum: 1,
  })
  tempo_preparo_minutos?: number;

  @IsInt({ message: "Número de porções deve ser um número inteiro" })
  @IsPositive({ message: "Número de porções deve ser positivo" })
  @IsOptional()
  @SchemaProperty({
    type: "number",
    description: "Número de porções que a receita rende",
    example: 10,
    minimum: 1,
  })
  porcoes?: number;

  @IsString()
  @IsOptional()
  @SchemaProperty({
    description: "Instruções detalhadas de como preparar a receita",
    example:
      "1. Pré-aqueça o forno a 180°C. 2. Derreta o chocolate em banho-maria. 3. Em uma tigela, misture os ingredientes secos. 4. Em outra tigela, bata os ovos com açúcar até dobrar de volume. 5. Adicione o chocolate derretido e a manteiga. 6. Incorpore os ingredientes secos gradualmente. 7. Despeje na forma untada e asse por 40-45 minutos.",
    minLength: 10,
  })
  modo_preparo?: string;

  @IsString()
  @IsOptional()
  @SchemaProperty({
    description: "Lista detalhada de ingredientes necessários",
    example:
      "• 250g de chocolate meio amargo\n• 4 ovos grandes\n• 1½ xícara (300g) de açúcar cristal\n• ¾ xícara (150g) de manteiga sem sal\n• 1¼ xícara (150g) de farinha de trigo\n• 1 colher (sopa) de fermento em pó\n• 1 pitada de sal\n• ½ xícara de leite integral\n• 1 colher (chá) de essência de baunilha",
  })
  ingredientes?: string;
}
