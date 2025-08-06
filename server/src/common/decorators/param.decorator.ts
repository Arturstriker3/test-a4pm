import "reflect-metadata";

// Símbolos para metadados
export const PARAM_METADATA_KEY = Symbol("param_metadata");

export interface ParamMetadata {
  index: number;
  paramName: string;
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
 * Função helper para obter metadados dos parâmetros
 */
export function getParamMetadata(target: any, propertyKey: string): ParamMetadata[] {
  return Reflect.getMetadata(PARAM_METADATA_KEY, target, propertyKey) || [];
}
