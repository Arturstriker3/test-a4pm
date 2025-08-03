import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersService } from "./users.service";
import { Controller, Get, Post, Put, Delete } from "../../common/decorators";
import {
  RouteAccess,
  AccessTo,
  RouteAccessType,
} from "../auth/decorators/access.decorators";
import { UserRole } from "./entities/user.entity";
import { ApiResponse } from "../../common/responses";

@injectable()
@Controller("/users")
export class UsersController {
  constructor(
    @inject(TYPES.UsersService) private readonly usersService: UsersService
  ) {}

  @Get("/")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async findAll(): Promise<ApiResponse<any[]>> {
    // TODO: Implementar busca de todos os usuários
    return ApiResponse.success([], "Usuários listados com sucesso");
  }

  @Get("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async findById(params: { id: string }): Promise<ApiResponse<any>> {
    // TODO: Implementar busca por ID
    return ApiResponse.success({ id: params.id }, "Usuário encontrado");
  }

  @Put("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  async update(params: { id: string }, body: any): Promise<ApiResponse<any>> {
    // TODO: Implementar atualização de usuário
    return ApiResponse.success(
      { id: params.id, ...body },
      "Usuário atualizado"
    );
  }

  @Delete("/:id")
  @RouteAccess(RouteAccessType.AUTHENTICATED)
  @AccessTo(UserRole.ADMIN)
  async delete(params: { id: string }): Promise<ApiResponse<void>> {
    // TODO: Implementar exclusão de usuário
    return ApiResponse.success(undefined, "Usuário excluído com sucesso");
  }
}
