import { UserRole } from "../../users/entities/user.entity";

// Enum para os tipos de acesso da rota
export enum RouteAccessType {
  PUBLIC = "PUBLIC",
  AUTHENTICATED = "AUTHENTICATED",
}

// Símbolos para os metadados
export const ROUTE_ACCESS_KEY = Symbol("route_access");
export const ACCESS_TO_KEY = Symbol("access_to");

/**
 * Decorator para definir o tipo de acesso da rota
 * @param accessType - PUBLIC ou AUTHENTICATED
 */
export function RouteAccess(accessType: RouteAccessType) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(ROUTE_ACCESS_KEY, accessType, target, propertyKey);
    return descriptor;
  };
}

/**
 * Decorator para definir quais roles podem acessar a rota
 * @param roles - Array de roles que podem acessar
 */
export function AccessTo(...roles: UserRole[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(ACCESS_TO_KEY, roles, target, propertyKey);
    return descriptor;
  };
}

/**
 * Função helper para obter os metadados de acesso
 */
export function getRouteAccess(target: any, propertyKey: string): RouteAccessType | undefined {
  return Reflect.getMetadata(ROUTE_ACCESS_KEY, target, propertyKey);
}

/**
 * Função helper para obter os roles permitidos
 */
export function getAccessRoles(target: any, propertyKey: string): UserRole[] | undefined {
  return Reflect.getMetadata(ACCESS_TO_KEY, target, propertyKey);
}
