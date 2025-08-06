import { IsString, IsUUID, MinLength } from "class-validator";

export class Category {
  @IsUUID()
  id!: string;

  @IsString()
  @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
  nome!: string;
}
