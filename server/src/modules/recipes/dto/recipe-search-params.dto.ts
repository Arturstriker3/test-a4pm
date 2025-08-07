import { IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { PaginationParamsDto } from "../../../common/dto";

/**
 * DTO para parâmetros de busca e filtro de receitas
 */
export class RecipeSearchParamsDto extends PaginationParamsDto {
	/**
	 * Termo de busca para pesquisar em nome, ingredientes e modo de preparo
	 */
	@IsOptional()
	@IsString({ message: "Termo de busca deve ser uma string" })
	search?: string;

	/**
	 * ID da categoria para filtrar receitas
	 */
	@IsOptional()
	@IsUUID("all", { message: "ID da categoria deve ser um UUID válido" })
	categoria_id?: string;
}
