import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  nome: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  nome?: string;
}
