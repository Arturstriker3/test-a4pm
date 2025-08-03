export * from "./auth.controller";
export * from "./auth.service";

// Exportar Use Cases
export { RegisterUserUseCase } from "./use-cases/register-user.use-case";

// Exportar os decorators para uso em outros módulos
export {
  RouteAccess,
  AccessTo,
  RouteAccessType,
  getRouteAccess,
  getAccessRoles,
  ROUTE_ACCESS_KEY,
  ACCESS_TO_KEY,
} from "./decorators/access.decorators";

// Exportar DTOs
export { RegisterDto, LoginDto } from "./dto/auth.dto";
