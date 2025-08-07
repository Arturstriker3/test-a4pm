import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/plugins/axios";
import { CookieService } from "@/services/cookie.service";
import type { User, LoginCredentials, RegisterData } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(CookieService.getAuthToken());
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.nivel_acesso === "ADMIN");

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true;
    try {
      const response = await api.post("/auth/login", credentials);
      const {
        token: authToken,
        userId,
        nome,
        email,
        role,
      } = response.data.data;

      const userData: User = {
        id: userId,
        nome: nome,
        login: email,
        nivel_acesso:
          role === "ADMIN" ? ("ADMIN" as const) : ("DEFAULT" as const),
      };

      token.value = authToken;
      user.value = userData;
      CookieService.setAuthToken(authToken);

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
      const {
        token: authToken,
        userId,
        nome,
        email,
        role,
      } = response.data.data;

      const userData: User = {
        id: userId,
        nome: nome,
        login: email,
        nivel_acesso:
          role === "ADMIN" ? ("ADMIN" as const) : ("DEFAULT" as const),
      };

      token.value = authToken;
      user.value = userData;
      CookieService.setAuthToken(authToken);

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
      CookieService.clearAllTokens();
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post("/auth/refresh");
      const { token: newToken } = response.data.data;

      token.value = newToken;
      CookieService.setAuthToken(newToken);

      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const fetchUserProfile = async () => {
    if (!token.value) return;

    try {
      const response = await api.get("/users/me");
      const { id, nome, email, role } = response.data.data;

      user.value = {
        id: id,
        nome: nome,
        login: email,
        nivel_acesso: role === "ADMIN" ? "ADMIN" : "DEFAULT",
      };
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      logout();
    }
  };

  return {
    user,
    token,
    isLoading,

    isAuthenticated,
    isAdmin,

    login,
    register,
    logout,
    refreshToken,
    fetchUserProfile,
  };
});
