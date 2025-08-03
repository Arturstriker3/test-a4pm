export const TYPES = {
  // Database
  DatabaseService: Symbol.for("DatabaseService"),

  // Auth Module
  AuthService: Symbol.for("AuthService"),
  AuthController: Symbol.for("AuthController"),

  // Users Module
  UsersService: Symbol.for("UsersService"),
  UsersController: Symbol.for("UsersController"),
  UsersRepository: Symbol.for("UsersRepository"),

  // Categories Module
  CategoriesService: Symbol.for("CategoriesService"),
  CategoriesController: Symbol.for("CategoriesController"),
  CategoriesRepository: Symbol.for("CategoriesRepository"),

  // Recipes Module
  RecipesService: Symbol.for("RecipesService"),
  RecipesController: Symbol.for("RecipesController"),
  RecipesRepository: Symbol.for("RecipesRepository"),
} as const;
