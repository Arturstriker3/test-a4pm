import "reflect-metadata";
import { LoginUserUseCase } from "../login-user.use-case";
import { UsersRepository } from "../../../users/users.repository";
import { UserBusinessRules } from "../../../users/rules/user.rules";
import { AuthMiddleware } from "../../../../common/middlewares/auth.middleware";
import { LoginDto, LoginResponseDto } from "../../dto";
import { User, UserRole } from "../../../users/entities/user.entity";
import { UnauthorizedException } from "../../../../common/exceptions";
import * as bcrypt from "bcrypt";

// Mock dos módulos externos
jest.mock("bcrypt", () => ({
	compare: jest.fn(),
}));
jest.mock("../../../users/rules/user.rules");
jest.mock("../../../../common/middlewares/auth.middleware");

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("LoginUserUseCase", () => {
	let loginUserUseCase: LoginUserUseCase;
	let usersRepositoryMock: UsersRepository;

	// Mocks dos métodos estáticos
	const mockValidateUserForLogin = UserBusinessRules.validateUserForLogin as jest.MockedFunction<typeof UserBusinessRules.validateUserForLogin>;
	const mockValidatePasswordMatch = UserBusinessRules.validatePasswordMatch as jest.MockedFunction<typeof UserBusinessRules.validatePasswordMatch>;
	const mockGenerateToken = AuthMiddleware.generateToken as jest.MockedFunction<typeof AuthMiddleware.generateToken>;
	const mockGenerateRecoveryToken = AuthMiddleware.generateRecoveryToken as jest.MockedFunction<typeof AuthMiddleware.generateRecoveryToken>;

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

		loginUserUseCase = new LoginUserUseCase(usersRepositoryMock);

		// Reset dos mocks
		jest.clearAllMocks();
	});

	describe("execute", () => {
		const validLoginDto: LoginDto = {
			login: "test@example.com",
			senha: "password123",
		};

		const mockUser: User = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			nome: "Test User",
			login: "test@example.com",
			senha: "$2b$10$hashedPassword",
			nivel_acesso: UserRole.DEFAULT,
			recovery_token: null,
			criado_em: new Date("2024-01-01"),
			alterado_em: new Date("2024-01-01"),
		};

		it("deve fazer login com sucesso quando as credenciais são válidas", async () => {
			// Arrange
			const expectedToken = "valid-jwt-token";
			const expectedRecoveryToken = "recovery-token";

			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(mockUser);
			mockedBcrypt.compare.mockResolvedValue(true as never);
			mockGenerateToken.mockReturnValue(expectedToken);
			mockGenerateRecoveryToken.mockReturnValue(expectedRecoveryToken);
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await loginUserUseCase.execute(validLoginDto);

			// Assert
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUserForLogin).toHaveBeenCalledWith(mockUser);
			expect(mockedBcrypt.compare).toHaveBeenCalledWith("password123", "$2b$10$hashedPassword");
			expect(mockValidatePasswordMatch).toHaveBeenCalledWith(true);
			expect(mockGenerateToken).toHaveBeenCalledWith({
				userId: mockUser.id,
				email: mockUser.login,
				role: mockUser.nivel_acesso,
			});
			expect(mockGenerateRecoveryToken).toHaveBeenCalledWith({
				userId: mockUser.id,
				email: mockUser.login,
			});
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith(mockUser.id, expectedRecoveryToken);

			expect(result).toBeInstanceOf(LoginResponseDto);
			expect(result.token).toBe(expectedToken);
			expect(result.userId).toBe(mockUser.id);
			expect(result.nome).toBe(mockUser.nome);
			expect(result.email).toBe(mockUser.login);
			expect(result.role).toBe(mockUser.nivel_acesso);
		});

		it("deve lançar exceção quando o usuário não existe", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(null);
			mockValidateUserForLogin.mockImplementation(() => {
				throw new UnauthorizedException("Email ou senha inválidos");
			});

			// Act & Assert
			await expect(loginUserUseCase.execute(validLoginDto)).rejects.toThrow(UnauthorizedException);
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUserForLogin).toHaveBeenCalledWith(null);
			expect(mockedBcrypt.compare).not.toHaveBeenCalled();
		});

		it("deve lançar exceção quando a senha está incorreta", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(mockUser);
			// Reset dos mocks que não devem ser chamados para este teste
			mockValidateUserForLogin.mockImplementation(() => {});
			mockedBcrypt.compare.mockResolvedValue(false as never);
			mockValidatePasswordMatch.mockImplementation(() => {
				throw new UnauthorizedException("Email ou senha inválidos");
			});

			// Act & Assert
			await expect(loginUserUseCase.execute(validLoginDto)).rejects.toThrow(UnauthorizedException);
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUserForLogin).toHaveBeenCalledWith(mockUser);
			expect(mockedBcrypt.compare).toHaveBeenCalledWith("password123", "$2b$10$hashedPassword");
			expect(mockValidatePasswordMatch).toHaveBeenCalledWith(false);
			expect(mockGenerateToken).not.toHaveBeenCalled();
		});

		it("deve lançar erro quando JWT_SECRET não está configurado", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(mockUser);
			// Reset dos mocks que não devem lançar exceção para este teste
			mockValidateUserForLogin.mockImplementation(() => {});
			mockedBcrypt.compare.mockResolvedValue(true as never);
			mockValidatePasswordMatch.mockImplementation(() => {});
			mockGenerateToken.mockImplementation(() => {
				throw new Error("JWT_SECRET não configurado nas variáveis de ambiente");
			});

			// Act & Assert
			await expect(loginUserUseCase.execute(validLoginDto)).rejects.toThrow("JWT_SECRET não configurado nas variáveis de ambiente");
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUserForLogin).toHaveBeenCalledWith(mockUser);
			expect(mockedBcrypt.compare).toHaveBeenCalledWith("password123", "$2b$10$hashedPassword");
			expect(mockValidatePasswordMatch).toHaveBeenCalledWith(true);
			expect(mockGenerateToken).toHaveBeenCalled();
		});

		it("deve propagar erro do repositório quando findByLogin falha", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			(usersRepositoryMock.findByLogin as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(loginUserUseCase.execute(validLoginDto)).rejects.toThrow("Database connection failed");
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUserForLogin).not.toHaveBeenCalled();
		});

		it("deve propagar erro do repositório quando updateRecoveryToken falha", async () => {
			// Arrange
			const expectedToken = "valid-jwt-token";
			const expectedRecoveryToken = "recovery-token";
			const repositoryError = new Error("Update failed");

			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(mockUser);
			// Reset dos mocks que não devem lançar exceção para este teste
			mockValidateUserForLogin.mockImplementation(() => {});
			mockedBcrypt.compare.mockResolvedValue(true as never);
			mockValidatePasswordMatch.mockImplementation(() => {});
			mockGenerateToken.mockReturnValue(expectedToken);
			mockGenerateRecoveryToken.mockReturnValue(expectedRecoveryToken);
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(loginUserUseCase.execute(validLoginDto)).rejects.toThrow("Update failed");
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith(mockUser.id, expectedRecoveryToken);
		});
	});

	describe("verifyPassword", () => {
		it("deve verificar senha corretamente quando é válida", async () => {
			// Arrange
			mockedBcrypt.compare.mockResolvedValue(true as never);

			// Act
			const result = await (loginUserUseCase as any).verifyPassword("plainPassword", "hashedPassword");

			// Assert
			expect(result).toBe(true);
			expect(mockedBcrypt.compare).toHaveBeenCalledWith("plainPassword", "hashedPassword");
		});

		it("deve verificar senha corretamente quando é inválida", async () => {
			// Arrange
			mockedBcrypt.compare.mockResolvedValue(false as never);

			// Act
			const result = await (loginUserUseCase as any).verifyPassword("wrongPassword", "hashedPassword");

			// Assert
			expect(result).toBe(false);
			expect(mockedBcrypt.compare).toHaveBeenCalledWith("wrongPassword", "hashedPassword");
		});
	});
});
