import "reflect-metadata";
import { LogoutUserUseCase } from "../logout-user.use-case";
import { UsersRepository } from "../../../users/users.repository";
import { UserIdDto } from "../../../users/dto/id.dto";

describe("LogoutUserUseCase", () => {
	let logoutUserUseCase: LogoutUserUseCase;
	let usersRepositoryMock: UsersRepository;

	beforeEach(() => {
		// Criação dos mocks
		usersRepositoryMock = {
			findByLogin: jest.fn(),
			updateRecoveryToken: jest.fn(),
			save: jest.fn(),
			findById: jest.fn(),
			findWithPagination: jest.fn(),
			count: jest.fn(),
		} as any;

		logoutUserUseCase = new LogoutUserUseCase(usersRepositoryMock);

		// Reset dos mocks
		jest.clearAllMocks();
	});

	describe("execute", () => {
		const validUserIdDto: UserIdDto = {
			id: "123e4567-e89b-12d3-a456-426614174000",
		};

		it("deve fazer logout com sucesso quando o ID do usuário é válido", async () => {
			// Arrange
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await logoutUserUseCase.execute(validUserIdDto);

			// Assert
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000", null);
			expect(result).toBe(true);
		});

		it("deve retornar true mesmo quando updateRecoveryToken é bem-sucedido", async () => {
			// Arrange
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await logoutUserUseCase.execute(validUserIdDto);

			// Assert
			expect(result).toBe(true);
		});

		it("deve propagar erro do repositório quando updateRecoveryToken falha", async () => {
			// Arrange
			const repositoryError = new Error("Database update failed");
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(logoutUserUseCase.execute(validUserIdDto)).rejects.toThrow("Database update failed");
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174000", null);
		});

		it("deve chamar updateRecoveryToken com null para remover o token", async () => {
			// Arrange
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			await logoutUserUseCase.execute(validUserIdDto);

			// Assert
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledTimes(1);
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith(validUserIdDto.id, null);
		});

		it("deve funcionar com diferentes IDs de usuário", async () => {
			// Arrange
			const differentUserIdDto: UserIdDto = {
				id: "987e6543-e21b-12d3-a456-426614174987",
			};
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await logoutUserUseCase.execute(differentUserIdDto);

			// Assert
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith("987e6543-e21b-12d3-a456-426614174987", null);
			expect(result).toBe(true);
		});

		it("deve sempre retornar true como indicação de sucesso", async () => {
			// Arrange
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await logoutUserUseCase.execute(validUserIdDto);

			// Assert
			expect(typeof result).toBe("boolean");
			expect(result).toBe(true);
		});

		it("deve não chamar outros métodos do repositório além do updateRecoveryToken", async () => {
			// Arrange
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			await logoutUserUseCase.execute(validUserIdDto);

			// Assert
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledTimes(1);
			expect(usersRepositoryMock.findByLogin).not.toHaveBeenCalled();
			expect(usersRepositoryMock.save).not.toHaveBeenCalled();
			expect(usersRepositoryMock.findById).not.toHaveBeenCalled();
			expect(usersRepositoryMock.findWithPagination).not.toHaveBeenCalled();
			expect(usersRepositoryMock.count).not.toHaveBeenCalled();
		});
	});
});
