import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
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
   * Esta é uma regra específica de domínio que requer consulta ao banco
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
   */
  static validateUserForLogin(user: any): void {
    if (!user) {
      throw new Error("Credenciais inválidas");
    }
  }

  /**
   * Regra de Negócio: Senha deve coincidir durante o login
   */
  static validatePasswordMatch(isPasswordValid: boolean): void {
    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }
  }

  /**
   * Regra de Negócio: Usuário não pode alterar seu próprio nível de acesso
   */
  static validateSelfRoleChange(
    currentUserId: string,
    targetUserId: string,
    isChangingRole: boolean
  ): void {
    if (currentUserId === targetUserId && isChangingRole) {
      throw new Error("Usuário não pode alterar seu próprio nível de acesso");
    }
  }

  /**
   * Regra de Negócio: Deve haver pelo menos um ADMIN no sistema
   */
  static validateLastAdminRemoval(
    userRole: string,
    remainingAdmins: number
  ): void {
    if (userRole === "ADMIN" && remainingAdmins <= 1) {
      throw new Error(
        "Não é possível remover o último administrador do sistema"
      );
    }
  }
}

/**
 * Domain Rules para controle de acesso
 */
export class AccessControlRules {
  /**
   * Regra: Apenas ADMIN pode criar outros usuários ADMIN
   */
  static validateAdminCreation(
    currentUserRole: string,
    targetRole: string
  ): void {
    if (targetRole === "ADMIN" && currentUserRole !== "ADMIN") {
      throw new Error(
        "Apenas administradores podem criar outros administradores"
      );
    }
  }

  /**
   * Regra: Usuário deve estar autenticado para acessar recursos protegidos
   */
  static validateAuthentication(isAuthenticated: boolean): void {
    if (!isAuthenticated) {
      throw new Error("Acesso negado. Autenticação requerida");
    }
  }

  /**
   * Regra: Usuário deve ter a role adequada para acessar o recurso
   */
  static validateAuthorization(
    userRoles: string[],
    requiredRoles: string[]
  ): void {
    if (requiredRoles.length === 0) return; // Se não há roles requeridas, permite acesso

    const hasRequiredRole = requiredRoles.some((role) =>
      userRoles.includes(role)
    );
    if (!hasRequiredRole) {
      throw new Error("Acesso negado. Permissões insuficientes");
    }
  }
}
