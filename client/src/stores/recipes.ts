import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";
import type {
  Recipe,
  CreateRecipeData,
  UpdateRecipeData,
  PaginatedResponse,
} from "@/types";

export const useRecipesStore = defineStore("recipes", () => {
  const recipes = ref<Recipe[]>([]);
  const currentRecipe = ref<Recipe | null>(null);
  const isLoading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchRecipes = async (
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string
  ) => {
    isLoading.value = true;
    try {
      const params: any = { page, limit };

      if (search && search.trim()) {
        params.search = search.trim();
      }

      if (categoryId) {
        params.categoria_id = categoryId;
      }

      const response = await api.get("/recipes", { params });

      const { items, ...paginationData } = response.data.data;
      recipes.value = items || [];
      pagination.value = paginationData;

      return { success: true };
    } catch (error: any) {
      console.error("Error fetching recipes:", error);
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

      const index = recipes.value.findIndex((recipe) => recipe.id === id);
      if (index !== -1) {
        recipes.value[index] = updatedRecipe;
      }

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

      recipes.value = recipes.value.filter((recipe) => recipe.id !== id);

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
    recipes,
    currentRecipe,
    isLoading,
    pagination,

    fetchRecipes,
    fetchRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    clearCurrentRecipe,
    clearRecipes,
  };
});
