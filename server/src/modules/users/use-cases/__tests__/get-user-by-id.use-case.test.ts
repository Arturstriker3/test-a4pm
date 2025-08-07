import "reflect-metadata";
import { GetUserByIdUseCase } from "../get-user-by-id.use-case";
import { UsersRepository } from "../../users.repository";
import { UserBusinessRules } from "../../rules/user.rules";
import { UserProfileDto } from "../../dto/user-profile.dto";
import { User, UserRole } from "../../entities/user.entity";
import { UnauthorizedException } from "../../../../common/exceptions";

// Mock dos módulos externos
jest.mock("../../rules/user.rules");

describe("GetUserByIdUseCase", () => {
	let getUserByIdUseCase: GetUserByIdUseCase;
	let usersRepositoryMock: UsersRepository;

	// Mocks dos métodos estáticos
	const mockValidateUserForGetUserData = UserBusinessRules.validateUserForGetUserData as jest.MockedFunction<typeof UserBusinessRules.validateUserForGetUserData>;

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

		getUserByIdUseCase = new GetUserByIdUseCase(usersRepositoryMock);

		// Reset dos mocks
		jest.clearAllMocks();
	});

	describe("execute", () => {
		const userId = "123e4567-e89b-12d3-a456-426614174000";

		const mockUser: User = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			nome: "Test User",
			login: "test@example.com",
			senha: "$2b$10$hashedPassword",
			nivel_acesso: UserRole.DEFAULT,
			recovery_token: null,
			criado_em: new Date("2024-01-01T10:00:00.000Z"),
			alterado_em: new Date("2024-01-02T15:30:00.000Z"),
		};

		it("deve retornar dados do usuário com sucesso quando usuário existe", async () => {
			// Arrange
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(mockUser);
			mockValidateUserForGetUserData.mockImplementation(() => {}); // Não lança exceção

			// Act
			const result = await getUserByIdUseCase.execute(userId);

			// Assert
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(userId);
			expect(mockValidateUserForGetUserData).toHaveBeenCalledWith(mockUser);

			expect(result).toBeInstanceOf(UserProfileDto);
			expect(result.id).toBe(mockUser.id);
			expect(result.nome).toBe(mockUser.nome);
			expect(result.email).toBe(mockUser.login);
			expect(result.role).toBe(mockUser.nivel_acesso);
			expect(result.criado_em).toBe(mockUser.criado_em);
			expect(result.alterado_em).toBe(mockUser.alterado_em);
		});

		it("deve lançar exceção quando usuário não existe", async () => {
			// Arrange
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(null);
			mockValidateUserForGetUserData.mockImplementation(() => {
				throw new UnauthorizedException("Usuário não encontrado ou inválido");
			});

			// Act & Assert
			await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(UnauthorizedException);
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(userId);
			expect(mockValidateUserForGetUserData).toHaveBeenCalledWith(null);
		});

		it("deve propagar erro do repositório quando findById falha", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			(usersRepositoryMock.findById as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow("Database connection failed");
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(userId);
			expect(mockValidateUserForGetUserData).not.toHaveBeenCalled();
		});

		it("deve mapear corretamente os campos do usuário para UserProfileDto", async () => {
			// Arrange
			const userWithDifferentData: User = {
				id: "987e6543-e21b-12d3-a456-426614174987",
				nome: "João Silva",
				login: "joao.silva@email.com",
				senha: "$2b$10$anotherHashedPassword",
				nivel_acesso: UserRole.ADMIN,
				recovery_token: "some-token",
				criado_em: new Date("2023-12-15T08:45:30.000Z"),
				alterado_em: new Date("2024-01-10T14:20:15.000Z"),
			};

			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(userWithDifferentData);
			mockValidateUserForGetUserData.mockImplementation(() => {});

			// Act
			const result = await getUserByIdUseCase.execute("987e6543-e21b-12d3-a456-426614174987");

			// Assert
			expect(result.id).toBe("987e6543-e21b-12d3-a456-426614174987");
			expect(result.nome).toBe("João Silva");
			expect(result.email).toBe("joao.silva@email.com");
			expect(result.role).toBe(UserRole.ADMIN);
			expect(result.criado_em).toEqual(new Date("2023-12-15T08:45:30.000Z"));
			expect(result.alterado_em).toEqual(new Date("2024-01-10T14:20:15.000Z"));
		});

		it("deve funcionar com diferentes tipos de usuário (DEFAULT e ADMIN)", async () => {
			// Arrange
			const adminUser: User = {
				id: "admin-id",
				nome: "Admin User",
				login: "admin@example.com",
				senha: "hashedPassword",
				nivel_acesso: UserRole.ADMIN,
				recovery_token: null,
				criado_em: new Date("2024-01-01"),
				alterado_em: new Date("2024-01-01"),
			};

			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(adminUser);
			mockValidateUserForGetUserData.mockImplementation(() => {});

			// Act
			const result = await getUserByIdUseCase.execute("admin-id");

			// Assert
			expect(result.role).toBe(UserRole.ADMIN);
			expect(result.nome).toBe("Admin User");
			expect(result.email).toBe("admin@example.com");
		});

		it("deve chamar apenas findById e validateUserForGetUserData", async () => {
			// Arrange
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(mockUser);
			mockValidateUserForGetUserData.mockImplementation(() => {});

			// Act
			await getUserByIdUseCase.execute(userId);

			// Assert
			expect(usersRepositoryMock.findById).toHaveBeenCalledTimes(1);
			expect(mockValidateUserForGetUserData).toHaveBeenCalledTimes(1);

			// Verificar que outros métodos não foram chamados
			expect(usersRepositoryMock.findByLogin).not.toHaveBeenCalled();
			expect(usersRepositoryMock.save).not.toHaveBeenCalled();
			expect(usersRepositoryMock.updateRecoveryToken).not.toHaveBeenCalled();
			expect(usersRepositoryMock.findWithPagination).not.toHaveBeenCalled();
			expect(usersRepositoryMock.count).not.toHaveBeenCalled();
		});

		it("deve retornar UserProfileDto sem campos sensíveis (senha, recovery_token)", async () => {
			// Arrange
			const userWithSensitiveData: User = {
				id: userId,
				nome: "Test User",
				login: "test@example.com",
				senha: "$2b$10$verySecretHashedPassword",
				nivel_acesso: UserRole.DEFAULT,
				recovery_token: "secret-recovery-token",
				criado_em: new Date("2024-01-01"),
				alterado_em: new Date("2024-01-01"),
			};

			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(userWithSensitiveData);
			mockValidateUserForGetUserData.mockImplementation(() => {});

			// Act
			const result = await getUserByIdUseCase.execute(userId);

			// Assert
			expect(result).not.toHaveProperty("senha");
			expect(result).not.toHaveProperty("recovery_token");
			expect(result).toHaveProperty("id");
			expect(result).toHaveProperty("nome");
			expect(result).toHaveProperty("email");
			expect(result).toHaveProperty("role");
			expect(result).toHaveProperty("criado_em");
			expect(result).toHaveProperty("alterado_em");
		});
	});
});
