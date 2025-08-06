import { IsString, IsUUID, IsInt, IsOptional, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
  description: "Dados da receita criada com sucesso",
})
export class CreateRecipeResponseDto {
  @IsUUID()
  @SchemaProperty({
    description: "ID único da receita criada",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @IsUUID()
  @SchemaProperty({
    description: "ID do usuário que criou a receita",
    format: "uuid",
    example: "987e6543-e21b-12d3-a456-426614174000",
  })
  id_usuarios!: string;

  @IsUUID()
  @SchemaProperty({
    description: "ID da categoria da receita",
    format: "uuid",
    example: "456e7890-e12b-12d3-a456-426614174000",
  })
  id_categorias!: string;

  @IsString()
  @SchemaProperty({
    description: "Nome da receita",
    example: "Bolo de Chocolate",
  })
  nome!: string;

  @IsInt()
  @IsOptional()
  @SchemaProperty({
    description: "Tempo de preparo em minutos",
    example: 45,
  })
  tempo_preparo_minutos?: number | null;

  @IsInt()
  @IsOptional()
  @SchemaProperty({
    description: "Número de porções que a receita rende",
    example: 8,
  })
  porcoes?: number | null;

  @IsString()
  @SchemaProperty({
    description: "Instruções detalhadas de como preparar a receita",
    example: "1. Pré-aqueça o forno a 180°C...",
  })
  modo_preparo!: string;

  @IsString()
  @IsOptional()
  @SchemaProperty({
    description: "Lista de ingredientes necessários",
    example: "200g de chocolate meio amargo, 3 ovos, 1 xícara de açúcar...",
  })
  ingredientes?: string | null;

  @IsDate()
  @Type(() => Date)
  @SchemaProperty({
    description: "Data de criação da receita",
    format: "date-time",
    example: "2025-08-06T10:30:00Z",
  })
  criado_em!: Date;

  @IsDate()
  @Type(() => Date)
  @SchemaProperty({
    description: "Data da última alteração da receita",
    format: "date-time",
    example: "2025-08-06T10:30:00Z",
  })
  alterado_em!: Date;

  constructor(data: {
    id: string;
    id_usuarios: string;
    id_categorias: string;
    nome: string;
    tempo_preparo_minutos?: number | null;
    porcoes?: number | null;
    modo_preparo: string;
    ingredientes?: string | null;
    criado_em: Date;
    alterado_em: Date;
  }) {
    this.id = data.id;
    this.id_usuarios = data.id_usuarios;
    this.id_categorias = data.id_categorias;
    this.nome = data.nome;
    this.tempo_preparo_minutos = data.tempo_preparo_minutos;
    this.porcoes = data.porcoes;
    this.modo_preparo = data.modo_preparo;
    this.ingredientes = data.ingredientes;
    this.criado_em = data.criado_em;
    this.alterado_em = data.alterado_em;
  }
}
