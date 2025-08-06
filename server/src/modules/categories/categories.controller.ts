import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { CategoriesService } from "./categories.service";
import { Controller, Get, Post, Put, Delete } from "../../common/decorators";
import { RouteAccess, AccessTo, RouteAccessType } from "../auth/decorators/access.decorators";
import { UserRole } from "../users/entities/user.entity";
import { ApiResponse } from "../../common/responses";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@injectable()
@Controller("/categories")
export class CategoriesController {
  constructor(
    @inject(TYPES.CategoriesService)
    private readonly categoriesService: CategoriesService
  ) {}

  // TODO: Implement methods
}
