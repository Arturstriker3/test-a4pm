import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersRepository } from "./users.repository";
import { User } from "./entities/user.entity";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class UsersService {
  constructor(
    @inject(TYPES.UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {}

  async findByLogin(login: string): Promise<User | null> {
    // TODO: Implementar busca por login no repository
    return null;
  }

  async create(
    userData: Omit<User, "id" | "criado_em" | "alterado_em">
  ): Promise<User> {
    const now = new Date();
    const newUser: User = {
      ...userData,
      id: uuidv4(),
      criado_em: now,
      alterado_em: now,
    };

    // TODO: Implementar criação no repository
    return newUser;
  }
}
