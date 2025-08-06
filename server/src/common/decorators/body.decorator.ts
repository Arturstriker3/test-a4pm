import "reflect-metadata";

export const BODY_METADATA_KEY = Symbol("body");

export interface BodyMetadata {
  index: number;
  dtoClass?: any;
}

/**
 * Decorator para marcar um parâmetro como body da requisição
 * @param dtoClass Classe DTO para validação (opcional)
 */
export function Body(dtoClass?: any): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingMetadata: BodyMetadata[] = Reflect.getMetadata(BODY_METADATA_KEY, target, propertyKey!) || [];

    existingMetadata.push({
      index: parameterIndex,
      dtoClass,
    });

    Reflect.defineMetadata(BODY_METADATA_KEY, existingMetadata, target, propertyKey!);
  };
}
