export * from "./auth.controller";
export * from "./auth.service";

// Exportar Use Cases
export { RegisterUserUseCase } from "./use-cases/register-user.use-case";
export { LoginUserUseCase } from "./use-cases/login-user.use-case";

// Exportar os decorators para uso em outros módulos
export { RouteAccess, AccessTo, RouteAccessType, getRouteAccess, getAccessRoles, ROUTE_ACCESS_KEY, ACCESS_TO_KEY } from "./decorators/access.decorators";

// Exportar DTOs
export { RegisterDto } from "./dto/register.dto";
export { RegisterResponseDto } from "./dto/register-response.dto";
export { LoginDto } from "./dto/login.dto";
export { LoginResponseDto } from "./dto/login-response.dto";
