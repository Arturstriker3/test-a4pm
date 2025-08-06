import "reflect-metadata";

// Símbolos para metadados
export const PARAM_METADATA_KEY = Symbol("param_metadata");
export const QUERY_METADATA_KEY = Symbol("query_metadata");

export interface ParamMetadata {
  index: number;
  paramName: string;
  dtoClass?: new () => any;
}

export interface QueryMetadata {
  index: number;
  dtoClass?: new () => any;
}

/**
 * Decorator para injetar parâmetros de URL validados com DTO
 * Similar ao @Param() do NestJS
 *
 * @param paramName - Nome do parâmetro na URL (ex: "id")
 * @param dtoClass - Classe DTO para validação (opcional)
 */
export function Param(paramName: string, dtoClass?: new () => any) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];

    const paramMetadata: ParamMetadata = {
      index: parameterIndex,
      paramName,
      dtoClass,
    };

    existingParams.push(paramMetadata);

    Reflect.defineMetadata(PARAM_METADATA_KEY, existingParams, target, propertyKey);
  };
}

/**
 * Decorator para injetar query parameters validados com DTO
 * Similar ao @Query() do NestJS
 *
 * @param dtoClass - Classe DTO para validação
 */
export function Query(dtoClass?: new () => any) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    const queryMetadata: QueryMetadata = {
      index: parameterIndex,
      dtoClass,
    };

    Reflect.defineMetadata(QUERY_METADATA_KEY, queryMetadata, target, propertyKey);
  };
}

/**
 * Função helper para obter metadados dos parâmetros
 */
export function getParamMetadata(target: any, propertyKey: string): ParamMetadata[] {
  return Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
}

/**
 * Função helper para obter metadados de query
 */
export function getQueryMetadata(target: any, propertyKey: string): QueryMetadata | undefined {
  return Reflect.getMetadata(QUERY_METADATA_KEY, target, propertyKey);
}
