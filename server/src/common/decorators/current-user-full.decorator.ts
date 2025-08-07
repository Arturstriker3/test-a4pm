import "reflect-metadata";

// Símbolos para metadados
export const CURRENT_USER_FULL_METADATA_KEY = Symbol("current_user_full_metadata");

export interface CurrentUserFullMetadata {
	index: number;
}

/**
 * Decorator para injetar o usuário autenticado completo (com role)
 *
 * Extrai todos os dados do usuário autenticado do token JWT
 * que foi validado pelo middleware de autenticação
 */
export function CurrentUserFull() {
	return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
		const existingMetadata: CurrentUserFullMetadata[] = Reflect.getMetadata(CURRENT_USER_FULL_METADATA_KEY, target, propertyKey) || [];

		const metadata: CurrentUserFullMetadata = {
			index: parameterIndex,
		};

		existingMetadata.push(metadata);

		Reflect.defineMetadata(CURRENT_USER_FULL_METADATA_KEY, existingMetadata, target, propertyKey);
	};
}

/**
 * Função helper para extrair metadados de @CurrentUserFull
 */
export function getCurrentUserFullMetadata(target: any, methodName: string): CurrentUserFullMetadata[] {
	return Reflect.getMetadata(CURRENT_USER_FULL_METADATA_KEY, target, methodName) || [];
}
