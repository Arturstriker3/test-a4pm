import "reflect-metadata";

// Símbolos para metadados
export const ROUTE_METADATA_KEY = Symbol("route_metadata");
export const CONTROLLER_PREFIX_KEY = Symbol("controller_prefix");

// Enum para métodos HTTP
export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

// Interface para metadados da rota
export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  methodName: string;
}

/**
 * Decorator para definir o prefixo do controller
 * @param prefix - Prefixo para todas as rotas do controller (ex: "/auth", "/users")
 */
export function Controller(prefix: string = "") {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata(CONTROLLER_PREFIX_KEY, prefix, constructor);
    return constructor;
  };
}

/**
 * Decorator para métodos GET
 * @param path - Caminho da rota (ex: "/", "/:id")
 */
export function Get(path: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRouteMetadata(target, propertyKey, HttpMethod.GET, path);
    return descriptor;
  };
}

/**
 * Decorator para métodos POST
 * @param path - Caminho da rota (ex: "/", "/create")
 */
export function Post(path: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRouteMetadata(target, propertyKey, HttpMethod.POST, path);
    return descriptor;
  };
}

/**
 * Decorator para métodos PUT
 * @param path - Caminho da rota (ex: "/:id")
 */
export function Put(path: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRouteMetadata(target, propertyKey, HttpMethod.PUT, path);
    return descriptor;
  };
}

/**
 * Decorator para métodos PATCH
 * @param path - Caminho da rota (ex: "/:id")
 */
export function Patch(path: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRouteMetadata(target, propertyKey, HttpMethod.PATCH, path);
    return descriptor;
  };
}

/**
 * Decorator para métodos DELETE
 * @param path - Caminho da rota (ex: "/:id")
 */
export function Delete(path: string = "") {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    setRouteMetadata(target, propertyKey, HttpMethod.DELETE, path);
    return descriptor;
  };
}

/**
 * Função auxiliar para definir metadados da rota
 */
function setRouteMetadata(
  target: any,
  propertyKey: string,
  method: HttpMethod,
  path: string
) {
  const existingRoutes: RouteMetadata[] =
    Reflect.getMetadata(ROUTE_METADATA_KEY, target.constructor) || [];

  const routeMetadata: RouteMetadata = {
    method,
    path,
    methodName: propertyKey,
  };

  existingRoutes.push(routeMetadata);
  Reflect.defineMetadata(
    ROUTE_METADATA_KEY,
    existingRoutes,
    target.constructor
  );
}

/**
 * Função para obter metadados das rotas de um controller
 */
export function getRouteMetadata(target: any): RouteMetadata[] {
  return Reflect.getMetadata(ROUTE_METADATA_KEY, target) || [];
}

/**
 * Função para obter o prefixo do controller
 */
export function getControllerPrefix(target: any): string {
  return Reflect.getMetadata(CONTROLLER_PREFIX_KEY, target) || "";
}
