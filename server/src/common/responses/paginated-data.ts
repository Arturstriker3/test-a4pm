/**
 * Interface para metadados de paginação
 */
export interface PaginationMeta {
  /** Página atual (baseada em 1) */
  currentPage: number;
  /** Número de itens por página */
  itemsPerPage: number;
  /** Total de itens encontrados */
  totalItems: number;
  /** Total de páginas */
  totalPages: number;
  /** Indica se existe uma próxima página */
  hasNextPage: boolean;
  /** Indica se existe uma página anterior */
  hasPreviousPage: boolean;
}

/**
 * Interface genérica para dados paginados
 */
export interface PaginatedData<T> {
  /** Array de itens da página atual */
  items: T[];
  /** Metadados de paginação */
  pagination: PaginationMeta;
}

/**
 * Classe utilitária para criar dados paginados
 */
export class PaginatedDataBuilder {
  /**
   * Cria uma estrutura de dados paginados
   * @param items Array de itens da página atual
   * @param currentPage Página atual (baseada em 1)
   * @param itemsPerPage Número de itens por página
   * @param totalItems Total de itens encontrados
   * @returns Estrutura de dados paginados
   */
  static create<T>(items: T[], currentPage: number, itemsPerPage: number, totalItems: number): PaginatedData<T> {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    return {
      items,
      pagination: {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  /**
   * Cria dados paginados vazios (quando não há resultados)
   * @param currentPage Página atual
   * @param itemsPerPage Itens por página
   * @returns Estrutura vazia de dados paginados
   */
  static empty<T>(currentPage: number = 1, itemsPerPage: number = 10): PaginatedData<T> {
    return this.create<T>([], currentPage, itemsPerPage, 0);
  }
}
