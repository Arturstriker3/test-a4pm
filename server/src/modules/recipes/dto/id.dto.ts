import { IsUUID } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "DTO contendo o ID da receita para operações que exigem identificação.",
})
export class RecipeIdDto {
  @IsUUID()
  @SchemaProperty({
    description: "ID único da receita",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;
}
