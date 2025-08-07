import "reflect-metadata";
import { GetCategoriesPaginatedUseCase, GetCategoriesPaginatedResult } from "../get-categories-paginated.use-case";
import { CategoriesRepository } from "../../categories.repository";
import { CategoryDto } from "../../dto/category.dto";
import { Category } from "../../entities/category.entity";

describe("GetCategoriesPaginatedUseCase", () => {
	let getCategoriesPaginatedUseCase: GetCategoriesPaginatedUseCase;
	let categoriesRepositoryMock: CategoriesRepository;

	beforeEach(() => {
		// Criação dos mocks
		categoriesRepositoryMock = {
			findWithPagination: jest.fn(),
			findById: jest.fn(),
			count: jest.fn(),
		} as any;

		getCategoriesPaginatedUseCase = new GetCategoriesPaginatedUseCase(categoriesRepositoryMock);

		// Reset dos mocks
		jest.clearAllMocks();
	});

	describe("execute", () => {
		const mockCategories: Category[] = [
			{ id: "123e4567-e89b-12d3-a456-426614174001", nome: "Carnes" },
			{ id: "123e4567-e89b-12d3-a456-426614174002", nome: "Bebidas" },
			{ id: "123e4567-e89b-12d3-a456-426614174003", nome: "Sobremesas" },
		];

		const mockTotal = 15;

		it("deve retornar categorias paginadas com sucesso", async () => {
			// Arrange
			const page = 1;
			const limit = 3;
			const offset = 0;

			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue(mockCategories);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(mockTotal);

			// Act
			const result = await getCategoriesPaginatedUseCase.execute(page, limit, offset);

			// Assert
			expect(categoriesRepositoryMock.findWithPagination).toHaveBeenCalledWith(offset, limit);
			expect(categoriesRepositoryMock.count).toHaveBeenCalledWith();

			expect(result).toHaveProperty("items");
			expect(result).toHaveProperty("total");
			expect(result.total).toBe(mockTotal);
			expect(result.items).toHaveLength(3);

			// Verificar se os itens são instâncias de CategoryDto
			result.items.forEach((item, index) => {
				expect(item).toBeInstanceOf(CategoryDto);
				expect(item.id).toBe(mockCategories[index].id);
				expect(item.nome).toBe(mockCategories[index].nome);
			});
		});

		it("deve retornar lista vazia quando não há categorias", async () => {
			// Arrange
			const page = 1;
			const limit = 10;
			const offset = 0;

			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue([]);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(0);

			// Act
			const result = await getCategoriesPaginatedUseCase.execute(page, limit, offset);

			// Assert
			expect(categoriesRepositoryMock.findWithPagination).toHaveBeenCalledWith(offset, limit);
			expect(categoriesRepositoryMock.count).toHaveBeenCalledWith();

			expect(result.items).toEqual([]);
			expect(result.total).toBe(0);
		});

		it("deve funcionar com diferentes valores de paginação", async () => {
			// Arrange
			const page = 2;
			const limit = 5;
			const offset = 5;
			const limitedCategories = mockCategories.slice(0, 2);

			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue(limitedCategories);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(mockTotal);

			// Act
			const result = await getCategoriesPaginatedUseCase.execute(page, limit, offset);

			// Assert
			expect(categoriesRepositoryMock.findWithPagination).toHaveBeenCalledWith(5, 5);
			expect(categoriesRepositoryMock.count).toHaveBeenCalledWith();

			expect(result.items).toHaveLength(2);
			expect(result.total).toBe(mockTotal);
		});

		it("deve mapear corretamente Category para CategoryDto", async () => {
			// Arrange
			const singleCategory: Category[] = [{ id: "category-id-123", nome: "Categoria Teste" }];

			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue(singleCategory);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(1);

			// Act
			const result = await getCategoriesPaginatedUseCase.execute(1, 1, 0);

			// Assert
			expect(result.items).toHaveLength(1);
			expect(result.items[0]).toBeInstanceOf(CategoryDto);
			expect(result.items[0].id).toBe("category-id-123");
			expect(result.items[0].nome).toBe("Categoria Teste");
		});

		it("deve executar findWithPagination e count em paralelo", async () => {
			// Arrange
			const page = 1;
			const limit = 10;
			const offset = 0;

			let findPromiseResolved = false;
			let countPromiseResolved = false;

			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => {
							findPromiseResolved = true;
							resolve(mockCategories);
						}, 10);
					})
			);

			(categoriesRepositoryMock.count as jest.Mock).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => {
							countPromiseResolved = true;
							resolve(mockTotal);
						}, 10);
					})
			);

			// Act
			const result = await getCategoriesPaginatedUseCase.execute(page, limit, offset);

			// Assert
			expect(findPromiseResolved).toBe(true);
			expect(countPromiseResolved).toBe(true);
			expect(result.items).toHaveLength(3);
			expect(result.total).toBe(mockTotal);
		});

		it("deve propagar erro do repositório quando findWithPagination falha", async () => {
			// Arrange
			const repositoryError = new Error("Database connection failed");
			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockRejectedValue(repositoryError);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(mockTotal);

			// Act & Assert
			await expect(getCategoriesPaginatedUseCase.execute(1, 10, 0)).rejects.toThrow("Database connection failed");
			expect(categoriesRepositoryMock.findWithPagination).toHaveBeenCalledWith(0, 10);
		});

		it("deve propagar erro do repositório quando count falha", async () => {
			// Arrange
			const repositoryError = new Error("Count query failed");
			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue(mockCategories);
			(categoriesRepositoryMock.count as jest.Mock).mockRejectedValue(repositoryError);

			// Act & Assert
			await expect(getCategoriesPaginatedUseCase.execute(1, 10, 0)).rejects.toThrow("Count query failed");
			expect(categoriesRepositoryMock.count).toHaveBeenCalledWith();
		});

		it("deve tratar corretamente quando ambas as operações falham", async () => {
			// Arrange
			const findError = new Error("Find operation failed");
			const countError = new Error("Count operation failed");

			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockRejectedValue(findError);
			(categoriesRepositoryMock.count as jest.Mock).mockRejectedValue(countError);

			// Act & Assert
			// Promise.all falha com o primeiro erro que ocorrer
			await expect(getCategoriesPaginatedUseCase.execute(1, 10, 0)).rejects.toThrow();
		});

		it("deve retornar resultado no formato correto", async () => {
			// Arrange
			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue(mockCategories);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(mockTotal);

			// Act
			const result: GetCategoriesPaginatedResult = await getCategoriesPaginatedUseCase.execute(1, 10, 0);

			// Assert
			expect(result).toEqual({
				items: expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(String),
						nome: expect.any(String),
					}),
				]),
				total: expect.any(Number),
			});
		});

		it("deve chamar apenas findWithPagination e count do repositório", async () => {
			// Arrange
			(categoriesRepositoryMock.findWithPagination as jest.Mock).mockResolvedValue(mockCategories);
			(categoriesRepositoryMock.count as jest.Mock).mockResolvedValue(mockTotal);

			// Act
			await getCategoriesPaginatedUseCase.execute(1, 10, 0);

			// Assert
			expect(categoriesRepositoryMock.findWithPagination).toHaveBeenCalledTimes(1);
			expect(categoriesRepositoryMock.count).toHaveBeenCalledTimes(1);
			expect(categoriesRepositoryMock.findById).not.toHaveBeenCalled();
		});
	});
});
