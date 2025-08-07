import "reflect-metadata";

// Símbolos para metadados
export const CURRENT_USER_METADATA_KEY = Symbol("current_user_metadata");

export interface CurrentUserMetadata {
	index: number;
}

/**
 * Decorator para injetar o usuário autenticado atual
 * Similar ao @CurrentUser() do NestJS
 *
 * Extrai os dados do usuário autenticado do token JWT
 * que foi validado pelo middleware de autenticação
 */
export function CurrentUser() {
	return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
		const existingMetadata: CurrentUserMetadata[] = Reflect.getMetadata(CURRENT_USER_METADATA_KEY, target, propertyKey) || [];

		const metadata: CurrentUserMetadata = {
			index: parameterIndex,
		};

		existingMetadata.push(metadata);

		Reflect.defineMetadata(CURRENT_USER_METADATA_KEY, existingMetadata, target, propertyKey);
	};
}

/**
 * Função helper para obter metadados do usuário atual
 */
export function getCurrentUserMetadata(target: any, propertyKey: string): CurrentUserMetadata[] {
	return Reflect.getMetadata(CURRENT_USER_METADATA_KEY, target, propertyKey) || [];
}
