import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/plugins/axios";

interface Category {
  id: string;
  nome: string;
}

export const useCategoriesStore = defineStore("categories", () => {
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);

  const fetchCategories = async () => {
    isLoading.value = true;
    try {
      const response = await api.get("/categories", {
        params: { limit: 100 },
      });

      categories.value = response.data.data.items || [];

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao buscar categorias",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const getCategoryById = (id: string) => {
    return categories.value.find((category) => category.id === id);
  };

  const getCategoryName = (id: string) => {
    const category = getCategoryById(id);
    return category?.nome || "Categoria não encontrada";
  };

  return {
    categories,
    isLoading,

    fetchCategories,
    getCategoryById,
    getCategoryName,
  };
});
