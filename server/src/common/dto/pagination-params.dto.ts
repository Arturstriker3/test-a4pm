import { IsOptional, IsInt, Min, Max } from "class-validator";
import { Transform } from "class-transformer";

/**
 * DTO para parâmetros de paginação
 */
export class PaginationParamsDto {
	/**
	 * Número da página (baseado em 1)
	 * @default 1
	 */
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt({ message: "Página deve ser um número inteiro" })
	@Min(1, { message: "Página deve ser maior que 0" })
	page?: number = 1;

	/**
	 * Número de itens por página
	 * @default 10
	 */
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt({ message: "Limite deve ser um número inteiro" })
	@Min(1, { message: "Limite deve ser maior que 0" })
	@Max(100, { message: "Limite máximo é 100 itens por página" })
	limit?: number = 10;

	/**
	 * Calcular o offset para queries de banco de dados
	 */
	get offset(): number {
		return (this.page! - 1) * this.limit!;
	}
}
