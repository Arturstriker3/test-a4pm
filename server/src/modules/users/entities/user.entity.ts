export interface User {
  id: string;
  nome: string;
  login: string;
  senha: string;
  criado_em: Date;
  alterado_em: Date;
}

export interface UserWithoutPassword extends Omit<User, "senha"> {}
