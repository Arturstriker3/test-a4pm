import { FastifyRequest, FastifyReply } from "fastify";
import { AuthMiddleware, AuthenticatedRequest, JwtPayload } from "./auth.middleware";
import { ROUTE_ACCESS_KEY, ACCESS_TO_KEY, RouteAccessType } from "../../modules/auth/decorators/access.decorators";

/**
 * Middleware que integra a autenticação JWT com os decoradores de acesso
 * Aplica automaticamente as regras de acesso baseadas nos metadados dos decoradores
 */
export class RouteAuthMiddleware {
  /**
   * Middleware principal que verifica autenticação baseado nos metadados da rota
   */
  static async checkAccess(
    request: FastifyRequest,
    reply: FastifyReply,
    target: any,
    methodName: string
  ): Promise<void> {
    // Obter metadados dos decoradores
    const accessType = Reflect.getMetadata(ROUTE_ACCESS_KEY, target, methodName) as RouteAccessType;
    const requiredRoles = Reflect.getMetadata(ACCESS_TO_KEY, target, methodName) as string[];

    // Se é rota pública, não precisa de autenticação
    if (accessType === RouteAccessType.PUBLIC) {
      return;
    }

    // Se é rota autenticada, validar JWT
    if (accessType === RouteAccessType.AUTHENTICATED) {
      await AuthMiddleware.authenticate(request, reply);

      // Se tem roles específicas, validar
      if (requiredRoles && requiredRoles.length > 0) {
        await AuthMiddleware.requireAnyRole(requiredRoles)(request, reply);
      }
    }
  }

  /**
   * Helper para obter os dados do usuário autenticado da requisição
   */
  static getUser(request: FastifyRequest): JwtPayload | null {
    const authenticatedRequest = request as AuthenticatedRequest;
    return authenticatedRequest.user || null;
  }

  /**
   * Helper para verificar se o usuário tem uma role específica
   */
  static hasRole(request: FastifyRequest, role: string): boolean {
    const user = RouteAuthMiddleware.getUser(request);
    return user?.role === role;
  }

  /**
   * Helper para verificar se o usuário tem pelo menos uma das roles
   */
  static hasAnyRole(request: FastifyRequest, roles: string[]): boolean {
    const user = RouteAuthMiddleware.getUser(request);
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Helper para verificar se o usuário é ADMIN
   */
  static isAdmin(request: FastifyRequest): boolean {
    return RouteAuthMiddleware.hasRole(request, "ADMIN");
  }

  /**
   * Helper para verificar se é o próprio usuário ou um admin
   */
  static isSelfOrAdmin(request: FastifyRequest, targetUserId: string): boolean {
    const user = RouteAuthMiddleware.getUser(request);
    if (!user) return false;

    return user.userId === targetUserId || user.role === "ADMIN";
  }
}
