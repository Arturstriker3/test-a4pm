import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ValidationException } from "../exceptions";

/**
 * Helper para validar parâmetros de URL usando DTOs
 */
export class ParamValidator {
  /**
   * Valida parâmetros usando um DTO específico
   * @param params - Parâmetros extraídos da URL
   * @param DtoClass - Classe DTO para validação
   * @returns Instância do DTO validada
   */
  static async validate<T>(params: any, DtoClass: new () => T): Promise<T> {
    // Converte os parâmetros para instância do DTO
    const dto = plainToClass(DtoClass, params);

    // Valida usando class-validator
    const errors = await validate(dto as any);

    if (errors.length > 0) {
      // Pega a primeira mensagem de erro
      const firstError = errors[0];
      const message = Object.values(firstError.constraints || {})[0] || "Erro de validação de parâmetros";
      throw new ValidationException(message);
    }

    return dto;
  }

  /**
   * Valida um UUID simples
   * @param id - String para validar
   * @param fieldName - Nome do campo para mensagem de erro
   */
  static validateUUID(id: string, fieldName: string = "ID"): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationException(`${fieldName} deve ser um UUID válido`);
    }
  }
}
