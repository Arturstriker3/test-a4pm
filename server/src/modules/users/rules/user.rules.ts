import {
  ConflictException,
  UnauthorizedException,
} from "../../../common/exceptions";

/**
 * Domain/Business Rules para o módulo de Users
 *
 * Essas regras representam as invariantes de negócio específicas do domínio,
 * não validações básicas que já estão na entidade com class-validator
 */

export class UserBusinessRules {
  /**
   * Regra de Negócio: Email deve ser único no sistema
   */
  static validateUniqueEmail(existingUser: any): void {
    if (existingUser) {
      throw new ConflictException(
        "Já existe um usuário cadastrado com este email"
      );
    }
  }

  /**
   * Regra de Negócio: Usuário deve existir para realizar login
   * Retorna mensagem genérica por segurança (não revela se usuário existe)
   */
  static validateUserForLogin(user: any): void {
    if (!user) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }
  }

  /**
   * Regra de Negócio: Senha deve coincidir durante o login
   * Retorna mensagem genérica por segurança (não revela que usuário existe)
   */
  static validatePasswordMatch(isPasswordValid: boolean): void {
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }
  }

  /**
   * Regra de Negócio: Usuário deve existir para refresh token
   * Retorna mensagem específica pois token já foi validado previamente
   */
  static validateUserForRefresh(user: any): void {
    if (!user) {
      throw new UnauthorizedException(
        "Usuário não encontrado para o token fornecido"
      );
    }
  }
}
