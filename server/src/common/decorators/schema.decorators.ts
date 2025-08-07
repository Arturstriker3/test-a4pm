import "reflect-metadata";

// Metadados para propriedades de schema
export const SCHEMA_PROPERTY_METADATA = Symbol("schema:property");
export const SCHEMA_CLASS_METADATA = Symbol("schema:class");

/**
 * Interface para configuração de propriedade do schema
 */
export interface SchemaPropertyOptions {
	type?: "string" | "number" | "boolean" | "array" | "object";
	description?: string;
	example?: any;
	format?: string;
	minimum?: number;
	maximum?: number;
	minLength?: number;
	maxLength?: number;
	enum?: (string | number)[];
	required?: boolean;
}

/**
 * Interface para configuração de classe do schema
 */
export interface SchemaClassOptions {
	description?: string;
	example?: any;
}

/**
 * Decorator para definir propriedades do schema Swagger
 */
export function SchemaProperty(options: SchemaPropertyOptions = {}) {
	return function (target: any, propertyKey: string) {
		// Obtém o tipo da propriedade usando reflect-metadata
		const type = Reflect.getMetadata("design:type", target, propertyKey);

		const existingProperties = Reflect.getMetadata(SCHEMA_PROPERTY_METADATA, target) || {};

		// Mapeia tipos TypeScript para tipos JSON Schema (se não fornecido explicitamente)
		let schemaType = options.type || "string";
		if (!options.type) {
			if (type === Number) {
				schemaType = "number";
			} else if (type === Boolean) {
				schemaType = "boolean";
			} else if (type === Array) {
				schemaType = "array";
			} else if (type === Object) {
				schemaType = "object";
			}
		}

		existingProperties[propertyKey] = {
			type: schemaType,
			...options,
		};

		Reflect.defineMetadata(SCHEMA_PROPERTY_METADATA, existingProperties, target);
	};
}

/**
 * Decorator para definir informações da classe no schema
 */
export function SchemaClass(options: SchemaClassOptions = {}) {
	return function (target: any) {
		Reflect.defineMetadata(SCHEMA_CLASS_METADATA, options, target);
	};
}

/**
 * Função para obter o schema JSON de uma classe DTO
 */
export function getSchemaFromDto(dtoClass: any): any {
	try {
		// Tenta criar uma instância vazia ou usa o prototype
		let instance: any;
		try {
			instance = new dtoClass();
		} catch {
			// Se falhar, usa o prototype da classe
			instance = Object.create(dtoClass.prototype);
		}

		const properties = Reflect.getMetadata(SCHEMA_PROPERTY_METADATA, instance) || {};
		const classMetadata = Reflect.getMetadata(SCHEMA_CLASS_METADATA, dtoClass) || {};

		// Obtém propriedades required do class-validator
		const requiredFields: string[] = [];
		for (const [propertyKey, propertyOptions] of Object.entries(properties)) {
			const validationMetadata = Reflect.getMetadata("class-validator", instance) || [];
			const hasRequiredValidation = validationMetadata.some((meta: any) => meta.propertyName === propertyKey && (meta.type === "isNotEmpty" || meta.type === "isEmail" || meta.type === "isString"));

			if (hasRequiredValidation || (propertyOptions as any).required) {
				requiredFields.push(propertyKey);
			}
		}

		// Remove 'example' das propriedades para evitar conflitos com Fastify
		const cleanProperties: any = {};

		for (const [key, value] of Object.entries(properties)) {
			const { example, ...cleanValue } = value as any;
			cleanProperties[key] = cleanValue; // Para validação do Fastify
		}

		const baseSchema = {
			type: "object",
			description: classMetadata.description,
			required: requiredFields.length > 0 ? requiredFields : undefined,
			properties: cleanProperties, // Sem examples para Fastify
		};

		return baseSchema;
	} catch (error) {
		console.error("Não foi possível gerar schema do DTO:", error);
		return {
			type: "object",
			properties: {},
		};
	}
}

export function getSchemaWithExamplesFromDto(dtoClass: any): any {
	try {
		// Tenta criar uma instância vazia ou usa o prototype
		let instance: any;
		try {
			instance = new dtoClass();
		} catch {
			// Se falhar, usa o prototype da classe
			instance = Object.create(dtoClass.prototype);
		}

		const properties = Reflect.getMetadata(SCHEMA_PROPERTY_METADATA, instance) || {};
		const classMetadata = Reflect.getMetadata(SCHEMA_CLASS_METADATA, dtoClass) || {};

		// Obtém propriedades required do class-validator
		const requiredFields: string[] = [];
		for (const [propertyKey, propertyOptions] of Object.entries(properties)) {
			const validationMetadata = Reflect.getMetadata("class-validator", instance) || [];
			const hasRequiredValidation = validationMetadata.some((meta: any) => meta.propertyName === propertyKey && (meta.type === "isNotEmpty" || meta.type === "isEmail" || meta.type === "isString"));

			if (hasRequiredValidation || (propertyOptions as any).required) {
				requiredFields.push(propertyKey);
			}
		}

		const schemaWithExamples = {
			type: "object",
			description: classMetadata.description,
			required: requiredFields.length > 0 ? requiredFields : undefined,
			properties: properties, // Com examples para Swagger
		};

		return schemaWithExamples;
	} catch (error) {
		console.error("Não foi possível gerar schema com examples do DTO:", error);
		return {
			type: "object",
			properties: {},
		};
	}
}
