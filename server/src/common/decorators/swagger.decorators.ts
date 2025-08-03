import "reflect-metadata";

// Metadata keys para os decorators
export const SWAGGER_METADATA = {
  API_OPERATION: Symbol("swagger:api-operation"),
  API_RESPONSE: Symbol("swagger:api-response"),
  API_BODY: Symbol("swagger:api-body"),
  API_TAG: Symbol("swagger:api-tag"),
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
}

export interface ApiBodyOptions {
  schema?: any;
  description?: string;
  required?: boolean;
}

export interface ApiTagOptions {
  name: string;
  description?: string;
}

// Decorator para operações
export function ApiOperation(options: ApiOperationOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(
      SWAGGER_METADATA.API_OPERATION,
      options,
      target,
      propertyKey
    );
    return descriptor;
  };
}

// Decorator para respostas
export function ApiResponse(options: ApiResponseOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const existingResponses =
      Reflect.getMetadata(SWAGGER_METADATA.API_RESPONSE, target, propertyKey) ||
      [];
    existingResponses.push(options);
    Reflect.defineMetadata(
      SWAGGER_METADATA.API_RESPONSE,
      existingResponses,
      target,
      propertyKey
    );
    return descriptor;
  };
}

// Decorator para body
export function ApiBody(options: ApiBodyOptions) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata(
      SWAGGER_METADATA.API_BODY,
      options,
      target,
      propertyKey
    );
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

// Função para extrair metadata de um método
export function getMethodMetadata(target: any, propertyKey: string) {
  const operation = Reflect.getMetadata(
    SWAGGER_METADATA.API_OPERATION,
    target,
    propertyKey
  );
  const responses =
    Reflect.getMetadata(SWAGGER_METADATA.API_RESPONSE, target, propertyKey) ||
    [];
  const body = Reflect.getMetadata(
    SWAGGER_METADATA.API_BODY,
    target,
    propertyKey
  );
  const classTags =
    Reflect.getMetadata(SWAGGER_METADATA.API_TAG, target.constructor) || [];

  return {
    operation,
    responses,
    body,
    tags: classTags,
  };
}
