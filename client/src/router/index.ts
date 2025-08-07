import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import { useAuthStore } from "@/stores/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresGuest: true },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/recipes",
      name: "recipes",
      component: () => import("../views/RecipesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/recipes/create",
      name: "recipes-create",
      component: () => import("../views/CreateRecipeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/recipes/:id/edit",
      name: "recipes-edit",
      component: () => import("../views/EditRecipeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Só busca perfil se temos token mas não temos dados do usuário
  // Isso acontece quando a página é recarregada
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUserProfile();
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      // Se falhar, o fetchUserProfile já chama logout()
    }
  }

  // Rota requer autenticação mas usuário não está logado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log("Redirecionando para login - usuário não autenticado");
    next("/login");
  }
  // Rota é para convidados mas usuário está logado
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log("Redirecionando para dashboard - usuário já autenticado");
    next("/dashboard");
  }
  // Usuário autenticado acessando home, redireciona para dashboard
  else if (to.path === "/" && authStore.isAuthenticated) {
    console.log("Redirecionando usuário logado da home para dashboard");
    next("/dashboard");
  }
  // Permite a navegação
  else {
    next();
  }
});

export default router;
