import { FastifyRequest, FastifyReply } from "fastify";
import * as jwt from "jsonwebtoken";
import { UnauthorizedException } from "../exceptions";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

/**
 * Middleware de autenticação JWT para Fastify
 * Valida o token JWT e adiciona os dados do usuário à requisição
 */
export class AuthMiddleware {
  private static readonly JWT_SECRET = process.env.JWT_SECRET;

  /**
   * Middleware principal de autenticação
   */
  static async authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const token = AuthMiddleware.extractTokenFromHeader(request);

      if (!token) {
        throw new UnauthorizedException("Token de acesso não fornecido");
      }

      if (!AuthMiddleware.JWT_SECRET) {
        throw new Error("JWT_SECRET não configurado nas variáveis de ambiente");
      }

      const decoded = jwt.verify(
        token,
        AuthMiddleware.JWT_SECRET
      ) as JwtPayload;

      // Adiciona os dados do usuário à requisição
      (request as AuthenticatedRequest).user = decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException("Token inválido");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException("Token expirado");
      }
      throw error;
    }
  }

  /**
   * Middleware para verificar se o usuário tem uma role específica
   */
  static requireRole(requiredRole: string) {
    return async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      const authenticatedRequest = request as AuthenticatedRequest;

      if (!authenticatedRequest.user) {
        throw new UnauthorizedException("Usuário não autenticado");
      }

      if (authenticatedRequest.user.role !== requiredRole) {
        throw new UnauthorizedException(
          `Acesso negado. Role '${requiredRole}' requerida`
        );
      }
    };
  }

  /**
   * Middleware para verificar se o usuário tem pelo menos uma das roles fornecidas
   */
  static requireAnyRole(allowedRoles: string[]) {
    return async (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> => {
      const authenticatedRequest = request as AuthenticatedRequest;

      if (!authenticatedRequest.user) {
        throw new UnauthorizedException("Usuário não autenticado");
      }

      if (!allowedRoles.includes(authenticatedRequest.user.role)) {
        throw new UnauthorizedException(
          `Acesso negado. Uma das seguintes roles é requerida: ${allowedRoles.join(
            ", "
          )}`
        );
      }
    };
  }

  /**
   * Extrai o token do header Authorization
   */
  private static extractTokenFromHeader(
    request: FastifyRequest
  ): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return null;
    }

    return token;
  }

  /**
   * Gera um token JWT para um usuário
   */
  static generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
    const secret = AuthMiddleware.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não configurado nas variáveis de ambiente");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

    return jwt.sign(payload as object, secret, {
      expiresIn: expiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Gera um token de recuperação de senha (tempo de vida menor)
   */
  static generateRecoveryToken(payload: {
    userId: string;
    email: string;
  }): string {
    const secret = AuthMiddleware.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET não configurado nas variáveis de ambiente");
    }

    const expiresIn = process.env.JWT_RECOVERY_EXPIRES_IN || "1h";

    return jwt.sign(payload as object, secret, {
      expiresIn: expiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Verifica se um token é válido sem lançar exceção
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      const secret = AuthMiddleware.JWT_SECRET;
      if (!secret) {
        return null;
      }

      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      return null;
    }
  }
}
