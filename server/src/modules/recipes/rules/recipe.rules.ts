import { BadRequestException } from "../../../common/exceptions";

/**
 * Domain/Business Rules para o módulo de Recipes
 *
 * Essas regras representam as invariantes de negócio específicas do domínio,
 * não validações básicas que já estão na entidade com class-validator
 */

export class RecipeBusinessRules {
	/**
	 * Regra de Negócio: Uma receita deve pertencer a uma categoria
	 */
	static validateCategoryIsRequired(id_categorias?: string): void {
		if (!id_categorias) {
			throw new BadRequestException("Uma receita deve pertencer a uma categoria");
		}
	}

	/**
	 * Regra de Negócio: Categoria deve existir no sistema
	 */
	static validateCategoryExists(category: any, categoryId: string): void {
		if (!category) {
			throw new BadRequestException(`Categoria com ID ${categoryId} não foi encontrada`);
		}
	}

	/**
	 * Regra de Negócio: Usuário deve existir para criar receita
	 */
	static validateUserExists(user: any): void {
		if (!user) {
			throw new BadRequestException("Usuário não encontrado ou inválido");
		}
	}

	/**
	 * Regra de Negócio: Nome da receita deve ser único para o usuário
	 */
	static validateUniqueRecipeNameForUser(existingRecipe: any, recipeName: string): void {
		if (existingRecipe) {
			throw new BadRequestException(`Você já possui uma receita com o nome "${recipeName}"`);
		}
	}

	/**
	 * Regra de Negócio: Tempo de preparo deve ser razoável (máximo 24 horas)
	 */
	static validateReasonablePrepTime(tempo_preparo_minutos?: number): void {
		if (tempo_preparo_minutos && tempo_preparo_minutos > 1440) {
			// 24 horas = 1440 minutos
			throw new BadRequestException("Tempo de preparo não pode exceder 24 horas (1440 minutos)");
		}
	}

	/**
	 * Regra de Negócio: Número de porções deve ser razoável (máximo 100)
	 */
	static validateReasonablePortions(porcoes?: number): void {
		if (porcoes && porcoes > 100) {
			throw new BadRequestException("Número de porções não pode exceder 100");
		}
	}
}
