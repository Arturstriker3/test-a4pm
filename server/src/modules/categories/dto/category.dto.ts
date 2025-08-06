import { IsString, IsUUID } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados de uma categoria",
})
export class CategoryDto {
  @IsUUID()
  @SchemaProperty({
    description: "ID único da categoria",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @IsString()
  @SchemaProperty({
    description: "Nome da categoria",
    example: "Carnes",
  })
  nome!: string;

  constructor(data: { id: string; nome: string }) {
    Object.assign(this, data);
  }
}
