import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";

interface Recipe {
  id: string;
  nome: string;
  ingredientes: string;
  modo_preparo: string;
  tempo_preparo: number;
  porcoes: number;
  id_categorias: string;
  categoria_nome: string;
  id_usuarios: string;
  usuario_nome: string;
  criado_em: string;
  alterado_em: string;
}

interface CreateRecipeData {
  nome: string;
  ingredientes: string;
  modo_preparo: string;
  tempo_preparo: number;
  porcoes: number;
  id_categorias: string;
}

interface UpdateRecipeData extends Partial<CreateRecipeData> {}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const useRecipesStore = defineStore("recipes", () => {
  // State
  const recipes = ref<Recipe[]>([]);
  const currentRecipe = ref<Recipe | null>(null);
  const isLoading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Actions
  const fetchRecipes = async (page = 1, limit = 10) => {
    isLoading.value = true;
    try {
      const response = await api.get("/recipes", {
        params: { page, limit },
      });

      const { data, ...paginationData } = response.data.data;
      recipes.value = data;
      pagination.value = paginationData;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao buscar receitas",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRecipeById = async (id: string) => {
    isLoading.value = true;
    try {
      const response = await api.get(`/recipes/${id}`);
      currentRecipe.value = response.data.data;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao buscar receita",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const createRecipe = async (data: CreateRecipeData) => {
    isLoading.value = true;
    try {
      const response = await api.post("/recipes", data);
      const newRecipe = response.data.data;

      // Adiciona a nova receita à lista
      recipes.value.unshift(newRecipe);

      return { success: true, data: newRecipe };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao criar receita",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const updateRecipe = async (id: string, data: UpdateRecipeData) => {
    isLoading.value = true;
    try {
      const response = await api.patch(`/recipes/${id}`, data);
      const updatedRecipe = response.data.data;

      // Atualiza a receita na lista
      const index = recipes.value.findIndex((recipe) => recipe.id === id);
      if (index !== -1) {
        recipes.value[index] = updatedRecipe;
      }

      // Atualiza a receita atual se for a mesma
      if (currentRecipe.value?.id === id) {
        currentRecipe.value = updatedRecipe;
      }

      return { success: true, data: updatedRecipe };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao atualizar receita",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const deleteRecipe = async (id: string) => {
    isLoading.value = true;
    try {
      await api.delete(`/recipes/${id}`);

      // Remove a receita da lista
      recipes.value = recipes.value.filter((recipe) => recipe.id !== id);

      // Limpa a receita atual se for a mesma
      if (currentRecipe.value?.id === id) {
        currentRecipe.value = null;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao deletar receita",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const clearCurrentRecipe = () => {
    currentRecipe.value = null;
  };

  const clearRecipes = () => {
    recipes.value = [];
    pagination.value = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
  };

  return {
    // State
    recipes,
    currentRecipe,
    isLoading,
    pagination,

    // Actions
    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    clearCurrentRecipe,
    clearRecipes,
  };
});
