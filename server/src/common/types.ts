export const TYPES = {
  // Database
  DatabaseService: Symbol.for("DatabaseService"),

  // Auth Module
  AuthService: Symbol.for("AuthService"),
  AuthController: Symbol.for("AuthController"),
  RegisterUserUseCase: Symbol.for("RegisterUserUseCase"),
  LoginUserUseCase: Symbol.for("LoginUserUseCase"),
  LogoutUserUseCase: Symbol.for("LogoutUserUseCase"),
  RefreshUserUseCase: Symbol.for("RefreshUserUseCase"),

  // Users Module
  UsersService: Symbol.for("UsersService"),
  UsersController: Symbol.for("UsersController"),
  UsersRepository: Symbol.for("UsersRepository"),
  GetUserByIdUseCase: Symbol.for("GetUserByIdUseCase"),
  GetUserByTokenUseCase: Symbol.for("GetUserByTokenUseCase"),

  // Categories Module
  CategoriesService: Symbol.for("CategoriesService"),
  CategoriesController: Symbol.for("CategoriesController"),
  CategoriesRepository: Symbol.for("CategoriesRepository"),
  GetCategoriesPaginatedUseCase: Symbol.for("GetCategoriesPaginatedUseCase"),

  // Recipes Module
  RecipesService: Symbol.for("RecipesService"),
  RecipesController: Symbol.for("RecipesController"),
  RecipesRepository: Symbol.for("RecipesRepository"),
  CreateRecipeUseCase: Symbol.for("CreateRecipeUseCase"),
} as const;
