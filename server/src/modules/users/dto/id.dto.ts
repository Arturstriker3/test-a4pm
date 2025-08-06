import { IsUUID } from "class-validator";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "DTO contendo o ID do usuário para operações que exigem identificação.",
})
export class UserIdDto {
  @IsUUID()
  @SchemaProperty({
    description: "ID único do usuário",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;
}
