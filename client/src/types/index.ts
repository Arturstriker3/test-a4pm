// Tipos da API
export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  nome: string;
  login: string;
  nivel_acesso: "ADMIN" | "DEFAULT";
}

export interface LoginCredentials {
  login: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  login: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Recipe {
  id: string;
  nome: string;
  ingredientes: string;
  modo_preparo: string;
  tempo_preparo_minutos: number;
  porcoes: number;
  id_categorias: string;
  categoria_nome: string;
  id_usuarios: string;
  usuario_nome: string;
  criado_em: string;
  alterado_em: string;
}

export interface CreateRecipeData {
  nome: string;
  ingredientes: string;
  modo_preparo: string;
  tempo_preparo_minutos: number;
  porcoes: number;
  id_categorias: string;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {}

export interface Category {
  id: string;
  nome: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "number";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface RecipeFilters {
  search?: string;
  categoria?: string;
  usuario?: string;
  tempo_preparo_min?: number;
  tempo_preparo_max?: number;
  porcoes_min?: number;
  porcoes_max?: number;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  iconClass: string;
}
