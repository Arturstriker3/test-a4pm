import { SchemaProperty, SchemaClass } from "../../../common/decorators";

@SchemaClass({
	description: "Dados de uma receita",
})
export class RecipeDto {
	@SchemaProperty({
		description: "ID único da receita",
		format: "uuid",
		example: "550e8400-e29b-41d4-a716-446655440000",
	})
	id!: string;

	@SchemaProperty({
		description: "Nome da receita",
		example: "Bolo de Chocolate",
	})
	nome!: string;

	@SchemaProperty({
		description: "Ingredientes necessários",
		example: "2 xícaras de farinha, 1 xícara de açúcar, 3 ovos, 200ml de leite",
	})
	ingredientes!: string;

	@SchemaProperty({
		description: "Modo de preparo passo a passo",
		example: "1. Misture os ingredientes secos. 2. Adicione os líquidos. 3. Asse por 30 minutos a 180°C",
	})
	modo_preparo!: string;

	@SchemaProperty({
		description: "Tempo de preparo em minutos",
		example: 45,
	})
	tempo_preparo_minutos!: number;

	@SchemaProperty({
		description: "Número de porções que a receita rende",
		example: 8,
	})
	porcoes!: number;

	@SchemaProperty({
		description: "ID da categoria da receita",
		format: "uuid",
		example: "550e8400-e29b-41d4-a716-446655440001",
	})
	id_categorias!: string;

	@SchemaProperty({
		description: "Nome da categoria",
		example: "Doces",
	})
	categoria_nome!: string;

	@SchemaProperty({
		description: "ID do usuário que criou a receita",
		format: "uuid",
		example: "550e8400-e29b-41d4-a716-446655440002",
	})
	id_usuarios!: string;

	@SchemaProperty({
		description: "Nome do usuário que criou a receita",
		example: "Maria Silva",
	})
	usuario_nome!: string;

	@SchemaProperty({
		description: "Data de criação da receita",
		format: "date-time",
		example: "2024-01-15T10:30:00.000Z",
	})
	criado_em!: Date;

	@SchemaProperty({
		description: "Data da última alteração da receita",
		format: "date-time",
		example: "2024-01-16T14:20:00.000Z",
	})
	alterado_em!: Date;

	constructor(data?: {
		id: string;
		nome: string;
		ingredientes: string;
		modo_preparo: string;
		tempo_preparo_minutos: number;
		porcoes: number;
		id_categorias: string;
		categoria_nome: string;
		id_usuarios: string;
		usuario_nome: string;
		criado_em: Date;
		alterado_em: Date;
	}) {
		Object.assign(this, data);
	}
}
