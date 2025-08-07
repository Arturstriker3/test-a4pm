import { injectable, inject } from "inversify";
import { TYPES } from "../../common/types";
import { UsersRepository } from "./users.repository";
import { GetUserByIdUseCase } from "./use-cases/get-user-by-id.use-case";
import { UserProfileDto } from "./dto/user-profile.dto";
import { AuthMiddleware } from "../../common/middlewares";
import { UserBusinessRules } from "./rules/user.rules";

@injectable()
export class UsersService {
	constructor(
		@inject(TYPES.UsersRepository)
		private readonly usersRepository: UsersRepository,
		@inject(TYPES.GetUserByIdUseCase)
		private readonly getUserByIdUseCase: GetUserByIdUseCase
	) {}

	async getUserById(userId: string): Promise<UserProfileDto> {
		return await this.getUserByIdUseCase.execute(userId);
	}

	async findAllPaginated(page: number, limit: number, offset: number): Promise<{ items: UserProfileDto[]; total: number }> {
		// Busca os usuários com paginação
		const users = await this.usersRepository.findWithPagination(offset, limit);

		// Busca o total de usuários para cálculo da paginação
		const total = await this.usersRepository.count();

		// Converte para DTO (note que o email é o login no banco)
		const items = users.map(
			(user) =>
				new UserProfileDto({
					id: user.id,
					nome: user.nome,
					email: user.login, // No banco o campo email é "login"
					role: user.nivel_acesso, // Mapeia nivel_acesso para role
					criado_em: user.criado_em,
					alterado_em: user.alterado_em,
				})
		);

		return { items, total };
	}
}
