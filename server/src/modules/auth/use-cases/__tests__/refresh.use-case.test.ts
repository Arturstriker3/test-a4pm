import "reflect-metadata";
import { RefreshUserUseCase } from "../refresh.use-case";
import { UsersRepository } from "../../../users/users.repository";
import { UserBusinessRules } from "../../../users/rules/user.rules";
import { AuthMiddleware, JwtPayload } from "../../../../common/middlewares/auth.middleware";
import { RefreshTokenDto, TokenResponseDto } from "../../dto";
import { User, UserRole } from "../../../users/entities/user.entity";
import { UnauthorizedException, NotFoundException } from "../../../../common/exceptions/app-exceptions";

// Mock dos módulos externos
jest.mock("../../../users/rules/user.rules");
jest.mock("../../../../common/middlewares/auth.middleware");

describe("RefreshUserUseCase", () => {
	let refreshUserUseCase: RefreshUserUseCase;
	let usersRepositoryMock: UsersRepository;

	// Mocks dos métodos estáticos
	const mockValidateUserForRefresh = UserBusinessRules.validateUserForRefresh as jest.MockedFunction<typeof UserBusinessRules.validateUserForRefresh>;
	const mockVerifyToken = AuthMiddleware.verifyToken as jest.MockedFunction<typeof AuthMiddleware.verifyToken>;
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

		refreshUserUseCase = new RefreshUserUseCase(usersRepositoryMock);

		// Reset dos mocks
		jest.clearAllMocks();
	});

	describe("execute", () => {
		const validRefreshTokenDto: RefreshTokenDto = {
			refreshToken: "valid-refresh-token",
		};

		const mockPayload: JwtPayload = {
			userId: "123e4567-e89b-12d3-a456-426614174000",
			email: "test@example.com",
			role: "DEFAULT",
		};

		const mockUser: User = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			nome: "Test User",
			login: "test@example.com",
			senha: "$2b$10$hashedPassword",
			nivel_acesso: UserRole.DEFAULT,
			recovery_token: "valid-refresh-token",
			criado_em: new Date("2024-01-01"),
			alterado_em: new Date("2024-01-01"),
		};

		it("deve renovar tokens com sucesso quando refresh token é válido", async () => {
			// Arrange
			const newAccessToken = "new-access-token";
			const newRefreshToken = "new-refresh-token";

			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(mockUser);
			mockValidateUserForRefresh.mockImplementation(() => {}); // Não lança exceção
			mockGenerateToken.mockReturnValue(newAccessToken);
			mockGenerateRecoveryToken.mockReturnValue(newRefreshToken);
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await refreshUserUseCase.execute(validRefreshTokenDto);

			// Assert
			expect(mockVerifyToken).toHaveBeenCalledWith("valid-refresh-token");
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(mockPayload.userId);
			expect(mockValidateUserForRefresh).toHaveBeenCalledWith(mockUser);
			expect(mockGenerateToken).toHaveBeenCalledWith({
				userId: mockUser.id,
				email: mockUser.login,
				role: mockUser.nivel_acesso,
			});
			expect(mockGenerateRecoveryToken).toHaveBeenCalledWith({
				userId: mockUser.id,
				email: mockUser.login,
			});
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith(mockUser.id, newRefreshToken);

			expect(result).toBeInstanceOf(TokenResponseDto);
			expect(result.token).toBe(newAccessToken);
			expect(result.refreshToken).toBe(newRefreshToken);
		});

		it("deve lançar exceção quando refresh token é inválido", async () => {
			// Arrange
			mockVerifyToken.mockReturnValue(null);

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow(UnauthorizedException);
			expect(mockVerifyToken).toHaveBeenCalledWith("valid-refresh-token");
			expect(usersRepositoryMock.findById).not.toHaveBeenCalled();
		});

		it("deve lançar exceção quando payload não contém userId", async () => {
			// Arrange
			const invalidPayload = { email: "test@example.com", role: "DEFAULT" } as JwtPayload;
			mockVerifyToken.mockReturnValue(invalidPayload);

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow(UnauthorizedException);
			expect(mockVerifyToken).toHaveBeenCalledWith("valid-refresh-token");
			expect(usersRepositoryMock.findById).not.toHaveBeenCalled();
		});

		it("deve lançar exceção quando usuário não é encontrado", async () => {
			// Arrange
			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(null);

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow(NotFoundException);
			expect(mockVerifyToken).toHaveBeenCalledWith("valid-refresh-token");
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(mockPayload.userId);
			expect(mockValidateUserForRefresh).not.toHaveBeenCalled();
		});

		it("deve lançar exceção quando UserBusinessRules.validateUserForRefresh falha", async () => {
			// Arrange
			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(mockUser);
			mockValidateUserForRefresh.mockImplementation(() => {
				throw new UnauthorizedException("Usuário não encontrado ou inválido");
			});

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow(UnauthorizedException);
			expect(mockValidateUserForRefresh).toHaveBeenCalledWith(mockUser);
			expect(mockGenerateToken).not.toHaveBeenCalled();
		});

		it("deve lançar exceção quando usuário não tem recovery_token", async () => {
			// Arrange
			const userWithoutToken = { ...mockUser, recovery_token: null };
			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(userWithoutToken);
			mockValidateUserForRefresh.mockImplementation(() => {});

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow(UnauthorizedException);
			expect(mockValidateUserForRefresh).toHaveBeenCalledWith(userWithoutToken);
			expect(mockGenerateToken).not.toHaveBeenCalled();
		});

		it("deve lançar exceção quando refresh token não corresponde ao armazenado", async () => {
			// Arrange
			const userWithDifferentToken = { ...mockUser, recovery_token: "different-token" };
			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(userWithDifferentToken);
			mockValidateUserForRefresh.mockImplementation(() => {});

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow(UnauthorizedException);
			expect(mockValidateUserForRefresh).toHaveBeenCalledWith(userWithDifferentToken);
			expect(mockGenerateToken).not.toHaveBeenCalled();
		});

		it("deve propagar erro do repositório quando findById falha", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow("Database connection failed");
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(mockPayload.userId);
		});

		it("deve propagar erro do repositório quando updateRecoveryToken falha", async () => {
			// Arrange
			const newAccessToken = "new-access-token";
			const newRefreshToken = "new-refresh-token";
			const repositoryError = new Error("Update failed");

			mockVerifyToken.mockReturnValue(mockPayload);
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(mockUser);
			mockValidateUserForRefresh.mockImplementation(() => {});
			mockGenerateToken.mockReturnValue(newAccessToken);
			mockGenerateRecoveryToken.mockReturnValue(newRefreshToken);
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(refreshUserUseCase.execute(validRefreshTokenDto)).rejects.toThrow("Update failed");
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith(mockUser.id, newRefreshToken);
		});
	});

	describe("verifyRefreshToken", () => {
		it("deve verificar refresh token corretamente", () => {
			// Arrange
			const validPayload: JwtPayload = {
				userId: "123e4567-e89b-12d3-a456-426614174000",
				email: "test@example.com",
				role: "DEFAULT",
			};
			mockVerifyToken.mockReturnValue(validPayload);

			// Act
			const result = (refreshUserUseCase as any).verifyRefreshToken("valid-token");

			// Assert
			expect(result).toEqual(validPayload);
			expect(mockVerifyToken).toHaveBeenCalledWith("valid-token");
		});

		it("deve lançar exceção quando token é inválido", () => {
			// Arrange
			mockVerifyToken.mockReturnValue(null);

			// Act & Assert
			expect(() => {
				(refreshUserUseCase as any).verifyRefreshToken("invalid-token");
			}).toThrow(UnauthorizedException);
		});
	});

	describe("getUserByPayload", () => {
		it("deve buscar usuário pelo payload corretamente", async () => {
			// Arrange
			const payload: JwtPayload = {
				userId: "123e4567-e89b-12d3-a456-426614174000",
				email: "test@example.com",
				role: "DEFAULT",
			};
			const expectedUser = { id: "123e4567-e89b-12d3-a456-426614174000", nome: "Test User" };
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(expectedUser);

			// Act
			const result = await (refreshUserUseCase as any).getUserByPayload(payload);

			// Assert
			expect(result).toEqual(expectedUser);
			expect(usersRepositoryMock.findById).toHaveBeenCalledWith(payload.userId);
		});

		it("deve lançar exceção quando usuário não é encontrado", async () => {
			// Arrange
			const payload: JwtPayload = {
				userId: "123e4567-e89b-12d3-a456-426614174000",
				email: "test@example.com",
				role: "DEFAULT",
			};
			(usersRepositoryMock.findById as jest.Mock).mockResolvedValue(null);

			// Act & Assert
			await expect((refreshUserUseCase as any).getUserByPayload(payload)).rejects.toThrow(NotFoundException);
		});
	});

	describe("validateStoredRefreshToken", () => {
		it("deve validar token armazenado corretamente", async () => {
			// Arrange
			const user = { recovery_token: "stored-token" } as User;

			// Act & Assert
			await expect((refreshUserUseCase as any).validateStoredRefreshToken(user, "stored-token")).resolves.toBeUndefined();
		});

		it("deve lançar exceção quando usuário não tem recovery_token", async () => {
			// Arrange
			const user = { recovery_token: null } as User;

			// Act & Assert
			await expect((refreshUserUseCase as any).validateStoredRefreshToken(user, "any-token")).rejects.toThrow(UnauthorizedException);
		});

		it("deve lançar exceção quando tokens não coincidem", async () => {
			// Arrange
			const user = { recovery_token: "stored-token" } as User;

			// Act & Assert
			await expect((refreshUserUseCase as any).validateStoredRefreshToken(user, "different-token")).rejects.toThrow(UnauthorizedException);
		});
	});

	describe("generateTokens", () => {
		it("deve gerar tokens corretamente", async () => {
			// Arrange
			const user: User = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				nome: "Test User",
				login: "test@example.com",
				senha: "hashedPassword",
				nivel_acesso: UserRole.DEFAULT,
				recovery_token: "old-token",
				criado_em: new Date(),
				alterado_em: new Date(),
			};
			const expectedAccessToken = "new-access-token";
			const expectedRefreshToken = "new-refresh-token";

			mockGenerateToken.mockReturnValue(expectedAccessToken);
			mockGenerateRecoveryToken.mockReturnValue(expectedRefreshToken);
			(usersRepositoryMock.updateRecoveryToken as jest.Mock).mockResolvedValue(undefined);

			// Act
			const result = await (refreshUserUseCase as any).generateTokens(user);

			// Assert
			expect(result).toEqual({
				token: expectedAccessToken,
				refreshToken: expectedRefreshToken,
			});
			expect(mockGenerateToken).toHaveBeenCalledWith({
				userId: user.id,
				email: user.login,
				role: user.nivel_acesso,
			});
			expect(mockGenerateRecoveryToken).toHaveBeenCalledWith({
				userId: user.id,
				email: user.login,
			});
			expect(usersRepositoryMock.updateRecoveryToken).toHaveBeenCalledWith(user.id, expectedRefreshToken);
		});
	});
});
