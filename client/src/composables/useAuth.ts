import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isAdmin = computed(() => authStore.isAdmin);
  const isLoading = computed(() => authStore.isLoading);

  const login = async (credentials: { login: string; senha: string }) => {
    const result = await authStore.login(credentials);
    if (result.success) {
      router.push("/dashboard");
    }
    return result;
  };

  const register = async (data: {
    nome: string;
    login: string;
    senha: string;
  }) => {
    const result = await authStore.register(data);
    if (result.success) {
      router.push("/dashboard");
    }
    return result;
  };

  const logout = async () => {
    await authStore.logout();
    router.push("/login");
  };

  const requireAuth = () => {
    if (!isAuthenticated.value) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!isAuthenticated.value) {
      router.push("/login");
      return false;
    }
    if (!isAdmin.value) {
      router.push("/unauthorized");
      return false;
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,

    login,
    register,
    logout,
    requireAuth,
    requireAdmin,
  };
}
