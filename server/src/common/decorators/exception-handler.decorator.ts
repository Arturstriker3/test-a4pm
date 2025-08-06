import { GlobalExceptionFilter } from "../filters/global-exception.filter";
import { ApiResponse } from "../responses";

/**
 * Decorator para automatizar o tratamento de exceções nos controllers
 * Similar ao @UseFilters() do NestJS
 */
export function HandleExceptions(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } catch (error) {
      return GlobalExceptionFilter.catch(error as Error);
    }
  };

  return descriptor;
}

/**
 * Decorator para aplicar em toda a classe
 */
export function HandleClassExceptions<T extends { new (...args: any[]): {} }>(constructor: T) {
  // Pegar todos os métodos da classe
  const methodNames = Object.getOwnPropertyNames(constructor.prototype).filter(
    (name) => name !== "constructor" && typeof constructor.prototype[name] === "function"
  );

  // Aplicar o tratamento de exceções em todos os métodos
  methodNames.forEach((methodName) => {
    const originalMethod = constructor.prototype[methodName];

    constructor.prototype[methodName] = async function (...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        return GlobalExceptionFilter.catch(error as Error);
      }
    };
  });

  return constructor;
}
