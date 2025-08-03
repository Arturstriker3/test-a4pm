import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsPositive,
  IsUUID,
} from "class-validator";

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsUUID()
  @IsOptional()
  id_categorias?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  tempo_preparo_minutos?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  porcoes?: number;

  @IsString()
  @IsNotEmpty()
  modo_preparo: string;

  @IsString()
  @IsOptional()
  ingredientes?: string;
}

export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsUUID()
  @IsOptional()
  id_categorias?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  tempo_preparo_minutos?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  porcoes?: number;

  @IsString()
  @IsOptional()
  modo_preparo?: string;

  @IsString()
  @IsOptional()
  ingredientes?: string;
}
