import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/plugins/axios";

interface User {
  id: string;
  nome: string;
  login: string;
  nivel_acesso: string;
}

interface LoginCredentials {
  login: string;
  senha: string;
}

interface RegisterData {
  nome: string;
  login: string;
  senha: string;
}

export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem("authToken"));
  const isLoading = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.nivel_acesso === "ADMIN");

  // Actions
  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    try {
      const response = await api.post("/auth/login", credentials);
      const { token: authToken, user: userData } = response.data.data;

      token.value = authToken;
      user.value = userData;
      localStorage.setItem("authToken", authToken);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao fazer login",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (data: RegisterData) => {
    isLoading.value = true;
    try {
      const response = await api.post("/auth/register", data);
      const { token: authToken, user: userData } = response.data.data;

      token.value = authToken;
      user.value = userData;
      localStorage.setItem("authToken", authToken);

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Erro ao criar conta",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem("authToken");
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { token: newToken } = response.data.data;

      token.value = newToken;
      localStorage.setItem("authToken", newToken);

      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const fetchUserProfile = async () => {
    if (!token.value) return;

    try {
      const response = await api.get("/users/profile");
      user.value = response.data.data;
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      logout();
    }
  };

  // Initialize
  const init = async () => {
    if (token.value) {
      await fetchUserProfile();
    }
  };

  return {
    // State
    user,
    token,
    isLoading,

    // Getters
    isAuthenticated,
    isAdmin,

    // Actions
    login,
    register,
    logout,
    refreshToken,
    fetchUserProfile,
    init,
  };
});
