import "reflect-metadata";
import { RegisterUserUseCase } from "../register-user.use-case";
import { UsersRepository } from "../../../users/users.repository";
import { UserBusinessRules } from "../../../users/rules/user.rules";
import { RegisterDto, RegisterResponseDto } from "../../dto";
import { User, UserRole } from "../../../users/entities/user.entity";
import { ConflictException } from "../../../../common/exceptions";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

// Mock dos módulos externos
jest.mock("bcrypt", () => ({
	hash: jest.fn(),
}));
jest.mock("uuid", () => ({
	v4: jest.fn(),
}));
jest.mock("../../../users/rules/user.rules");

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

describe("RegisterUserUseCase", () => {
	let registerUserUseCase: RegisterUserUseCase;
	let usersRepositoryMock: UsersRepository;

	// Mocks dos métodos estáticos
	const mockValidateUniqueEmail = UserBusinessRules.validateUniqueEmail as jest.MockedFunction<typeof UserBusinessRules.validateUniqueEmail>;

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

		registerUserUseCase = new RegisterUserUseCase(usersRepositoryMock);

		// Reset dos mocks
		jest.clearAllMocks();
	});

	describe("execute", () => {
		const validRegisterDto: RegisterDto = {
			nome: "Test User",
			login: "test@example.com",
			senha: "password123",
		};

		const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
		const mockHashedPassword = "$2b$10$hashedPassword";
		const mockDate = new Date("2024-01-01");

		const expectedUser: User = {
			id: mockUserId,
			nome: "Test User",
			login: "test@example.com",
			senha: mockHashedPassword,
			nivel_acesso: UserRole.DEFAULT,
			recovery_token: null,
			criado_em: mockDate,
			alterado_em: mockDate,
		};

		beforeEach(() => {
			// Mock do Date constructor para retornar data fixa
			jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it("deve registrar usuário com sucesso quando dados são válidos", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(null);
			mockValidateUniqueEmail.mockImplementation(() => {}); // Não lança exceção
			mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
			(mockedUuidv4 as any).mockReturnValue(mockUserId);
			(usersRepositoryMock.save as jest.Mock).mockResolvedValue(expectedUser);

			// Act
			const result = await registerUserUseCase.execute(validRegisterDto);

			// Assert
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUniqueEmail).toHaveBeenCalledWith(null);
			expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
			expect(mockedUuidv4).toHaveBeenCalled();
			expect(usersRepositoryMock.save).toHaveBeenCalledWith(expectedUser);

			expect(result).toBeInstanceOf(RegisterResponseDto);
			expect(result.id).toBe(mockUserId);
			expect(result.nome).toBe("Test User");
			expect(result.login).toBe("test@example.com");
			expect(result.nivel_acesso).toBe(UserRole.DEFAULT);
			expect(result.criado_em).toBe(mockDate);
			expect(result.alterado_em).toBe(mockDate);
		});

		it("deve lançar exceção quando já existe usuário com o email informado", async () => {
			// Arrange
			const existingUser = { id: "existing-id", login: "test@example.com" };
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(existingUser);
			mockValidateUniqueEmail.mockImplementation(() => {
				throw new ConflictException("Já existe um usuário cadastrado com este email");
			});

			// Act & Assert
			await expect(registerUserUseCase.execute(validRegisterDto)).rejects.toThrow(ConflictException);
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUniqueEmail).toHaveBeenCalledWith(existingUser);
			expect(mockedBcrypt.hash).not.toHaveBeenCalled();
			expect(usersRepositoryMock.save).not.toHaveBeenCalled();
		});

		it("deve propagar erro do repositório quando findByLogin falha", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			(usersRepositoryMock.findByLogin as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(registerUserUseCase.execute(validRegisterDto)).rejects.toThrow("Database connection failed");
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUniqueEmail).not.toHaveBeenCalled();
		});

		it("deve propagar erro do bcrypt quando hash falha", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(null);
			mockValidateUniqueEmail.mockImplementation(() => {});
			const hashError = new Error("Hash generation failed");
			mockedBcrypt.hash.mockRejectedValue(hashError as never);

			// Act & Assert
			await expect(registerUserUseCase.execute(validRegisterDto)).rejects.toThrow("Hash generation failed");
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUniqueEmail).toHaveBeenCalledWith(null);
			expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
			expect(usersRepositoryMock.save).not.toHaveBeenCalled();
		});

		it("deve propagar erro do repositório quando save falha", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(null);
			mockValidateUniqueEmail.mockImplementation(() => {});
			mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
			(mockedUuidv4 as any).mockReturnValue(mockUserId);
			const saveError = new Error("Save operation failed");
			(usersRepositoryMock.save as jest.Mock).mockRejectedValue(saveError);

			// Act & Assert
			await expect(registerUserUseCase.execute(validRegisterDto)).rejects.toThrow("Save operation failed");
			expect(usersRepositoryMock.save).toHaveBeenCalledWith(expectedUser);
		});

		it("deve criar entidade usuário com valores padrão corretos", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(null);
			mockValidateUniqueEmail.mockImplementation(() => {});
			mockedBcrypt.hash.mockResolvedValue(mockHashedPassword as never);
			(mockedUuidv4 as any).mockReturnValue(mockUserId);
			(usersRepositoryMock.save as jest.Mock).mockResolvedValue(expectedUser);

			// Act
			await registerUserUseCase.execute(validRegisterDto);

			// Assert - Verificar se a entidade foi criada com valores corretos
			expect(usersRepositoryMock.save).toHaveBeenCalledWith({
				id: mockUserId,
				nome: "Test User",
				login: "test@example.com",
				senha: mockHashedPassword,
				nivel_acesso: UserRole.DEFAULT,
				recovery_token: null,
				criado_em: mockDate,
				alterado_em: mockDate,
			});
		});
	});

	describe("validateBusinessRules", () => {
		it("deve validar business rules corretamente", async () => {
			// Arrange
			(usersRepositoryMock.findByLogin as jest.Mock).mockResolvedValue(null);
			mockValidateUniqueEmail.mockImplementation(() => {});

			// Act
			await (registerUserUseCase as any).validateBusinessRules({ login: "test@example.com" });

			// Assert
			expect(usersRepositoryMock.findByLogin).toHaveBeenCalledWith("test@example.com");
			expect(mockValidateUniqueEmail).toHaveBeenCalledWith(null);
		});
	});

	describe("hashPassword", () => {
		it("deve gerar hash da senha corretamente", async () => {
			// Arrange
			const expectedHash = "$2b$10$hashedPassword";
			mockedBcrypt.hash.mockResolvedValue(expectedHash as never);

			// Act
			const result = await (registerUserUseCase as any).hashPassword("password123");

			// Assert
			expect(result).toBe(expectedHash);
			expect(mockedBcrypt.hash).toHaveBeenCalledWith("password123", 10);
		});
	});

	describe("createUserEntity", () => {
		it("deve criar entidade de usuário corretamente", async () => {
			// Arrange
			const registerDto = { nome: "Test User", login: "test@example.com", senha: "password123" };
			const hashedPassword = "$2b$10$hashedPassword";
			const userId = "123e4567-e89b-12d3-a456-426614174000";
			const mockDate = new Date("2024-01-01");

			(mockedUuidv4 as any).mockReturnValue(userId);
			jest.spyOn(global, "Date").mockImplementation(() => mockDate as any);

			// Act
			const result = (registerUserUseCase as any).createUserEntity(registerDto, hashedPassword);

			// Assert
			expect(result).toEqual({
				id: userId,
				nome: "Test User",
				login: "test@example.com",
				senha: hashedPassword,
				nivel_acesso: UserRole.DEFAULT,
				recovery_token: null,
				criado_em: mockDate,
				alterado_em: mockDate,
			});

			// Cleanup
			jest.restoreAllMocks();
		});
	});
});
