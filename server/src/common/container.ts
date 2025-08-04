import { Container } from "inversify";
import { TYPES } from "./types";

// Database
import { DatabaseService } from "../app/database.service";

// Auth Module
import { AuthService } from "../modules/auth/auth.service";
import { AuthController } from "../modules/auth/auth.controller";
import { RegisterUserUseCase } from "../modules/auth/use-cases/register-user.use-case";
import { LoginUserUseCase } from "../modules/auth/use-cases/login-user.use-case";
import { LogoutUserUseCase } from "../modules/auth/use-cases/logout-user.use-case";
import { RefreshUserUseCase } from "../modules/auth/use-cases/refresh.use-case";

// Users Module
import { UsersService } from "../modules/users/users.service";
import { UsersController } from "../modules/users/users.controller";
import { UsersRepository } from "../modules/users/users.repository";

// Categories Module
import { CategoriesService } from "../modules/categories/categories.service";
import { CategoriesController } from "../modules/categories/categories.controller";
import { CategoriesRepository } from "../modules/categories/categories.repository";

// Recipes Module
import { RecipesService } from "../modules/recipes/recipes.service";
import { RecipesController } from "../modules/recipes/recipes.controller";
import { RecipesRepository } from "../modules/recipes/recipes.repository";

const container = new Container();

// Bind Database
container
  .bind<DatabaseService>(TYPES.DatabaseService)
  .to(DatabaseService)
  .inSingletonScope();

// Bind Auth Module
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container
  .bind<RegisterUserUseCase>(TYPES.RegisterUserUseCase)
  .to(RegisterUserUseCase);
container.bind<LoginUserUseCase>(TYPES.LoginUserUseCase).to(LoginUserUseCase);
container
  .bind<LogoutUserUseCase>(TYPES.LogoutUserUseCase)
  .to(LogoutUserUseCase);
container
  .bind<RefreshUserUseCase>(TYPES.RefreshUserUseCase)
  .to(RefreshUserUseCase);

// Bind Users Module
container.bind<UsersService>(TYPES.UsersService).to(UsersService);
container.bind<UsersController>(TYPES.UsersController).to(UsersController);
container.bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository);

// Bind Categories Module
container
  .bind<CategoriesService>(TYPES.CategoriesService)
  .to(CategoriesService);
container
  .bind<CategoriesController>(TYPES.CategoriesController)
  .to(CategoriesController);
container
  .bind<CategoriesRepository>(TYPES.CategoriesRepository)
  .to(CategoriesRepository);

// Bind Recipes Module
container.bind<RecipesService>(TYPES.RecipesService).to(RecipesService);
container
  .bind<RecipesController>(TYPES.RecipesController)
  .to(RecipesController);
container
  .bind<RecipesRepository>(TYPES.RecipesRepository)
  .to(RecipesRepository);

export { container };
