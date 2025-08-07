import "reflect-metadata";

// Metadata keys para os decorators
export const SWAGGER_METADATA = {
	API_OPERATION: Symbol("swagger:api-operation"),
	API_RESPONSE: Symbol("swagger:api-response"),
	API_BODY: Symbol("swagger:api-body"),
	API_TAG: Symbol("swagger:api-tag"),
	API_QUERY: Symbol("swagger:api-query"),
} as const;

// Interfaces para tipagem
export interface ApiOperationOptions {
	summary?: string;
	description?: string;
	tags?: string[];
}

export interface ApiResponseOptions {
	status: number;
	description?: string;
	schema?: any;
	type?: any; // Classe DTO
}

export interface ApiBodyOptions {
	schema?: any;
	description?: string;
	required?: boolean;
	type?: any; // Classe DTO
}

export interface ApiTagOptions {
	name: string;
	description?: string;
}

export interface ApiQueryOptions {
	name: string;
	type?: "string" | "number" | "boolean" | "array";
	description?: string;
	required?: boolean;
	example?: any;
	minimum?: number;
	maximum?: number;
	default?: any;
}

// Decorator para operações
export function ApiOperation(options: ApiOperationOptions) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		Reflect.defineMetadata(SWAGGER_METADATA.API_OPERATION, options, target, propertyKey);
		return descriptor;
	};
}

// Decorator para respostas
export function ApiResponse(options: ApiResponseOptions) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const existingResponses = Reflect.getMetadata(SWAGGER_METADATA.API_RESPONSE, target, propertyKey) || [];

		// Se um tipo DTO foi fornecido, gera o schema automaticamente
		if (options.type && !options.schema) {
			try {
				const { getSchemaFromDto } = require("./schema.decorators");
				options.schema = getSchemaFromDto(options.type);
			} catch (error) {
				console.warn("Não foi possível gerar schema do DTO:", error);
			}
		}

		existingResponses.push(options);
		Reflect.defineMetadata(SWAGGER_METADATA.API_RESPONSE, existingResponses, target, propertyKey);
		return descriptor;
	};
}

// Decorator para body
export function ApiBody(options: ApiBodyOptions) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		// Se um tipo DTO foi fornecido, gera o schema automaticamente
		if (options.type && !options.schema) {
			try {
				const { getSchemaFromDto } = require("./schema.decorators");
				options.schema = getSchemaFromDto(options.type);
			} catch (error) {
				console.warn("Não foi possível gerar schema do DTO:", error);
			}
		}

		Reflect.defineMetadata(SWAGGER_METADATA.API_BODY, options, target, propertyKey);
		return descriptor;
	};
}

// Decorator para tags da classe
export function ApiTags(...tags: string[]) {
	return function (target: any) {
		Reflect.defineMetadata(SWAGGER_METADATA.API_TAG, tags, target);
		return target;
	};
}

// Decorator para query parameters
export function ApiQuery(options: ApiQueryOptions) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const existingQueries = Reflect.getMetadata(SWAGGER_METADATA.API_QUERY, target, propertyKey) || [];
		existingQueries.push(options);
		Reflect.defineMetadata(SWAGGER_METADATA.API_QUERY, existingQueries, target, propertyKey);
		return descriptor;
	};
}

// Função para extrair metadata de um método
export function getMethodMetadata(target: any, propertyKey: string) {
	const operation = Reflect.getMetadata(SWAGGER_METADATA.API_OPERATION, target, propertyKey);
	const responses = Reflect.getMetadata(SWAGGER_METADATA.API_RESPONSE, target, propertyKey) || [];
	const body = Reflect.getMetadata(SWAGGER_METADATA.API_BODY, target, propertyKey);
	const queries = Reflect.getMetadata(SWAGGER_METADATA.API_QUERY, target, propertyKey) || [];
	const classTags = Reflect.getMetadata(SWAGGER_METADATA.API_TAG, target.constructor) || [];

	return {
		operation,
		responses,
		body,
		queries,
		tags: classTags,
	};
}
