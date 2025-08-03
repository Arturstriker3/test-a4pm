import { ConflictException } from "../../../common/exceptions";

/**
 * Domain/Business Rules para o módulo de Users
 *
 * Essas regras representam as invariantes de negócio específicas do domínio,
 * não validações básicas que já estão na entidade com class-validator
 */

export class UserBusinessRules {
  /**
   * Regra de Negócio: Email deve ser único no sistema
   * Esta é uma regra específica de domínio que requer consulta ao banco
   */
  static validateUniqueEmail(existingUser: any): void {
    if (existingUser) {
      throw new ConflictException(
        "Já existe um usuário cadastrado com este email"
      );
    }
  }
}
