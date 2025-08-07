import axios from "axios";
import { CookieService } from "@/services/cookie.service";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Função para processar as requisições em fila
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = CookieService.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 e não for uma tentativa de refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      // Se já está tentando fazer refresh, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marca que está fazendo refresh e marca a requisição como retry
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tenta fazer refresh do token
        const refreshResponse = await api.post("/auth/refresh");
        const { token: newToken } = refreshResponse.data.data;

        // Atualiza o token no cookie
        CookieService.setAuthToken(newToken);

        // Processa a fila de requisições pendentes
        processQueue(null, newToken);

        // Refaz a requisição original com o novo token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Falha no refresh - remove tokens e redireciona para login
        processQueue(refreshError, null);
        CookieService.clearAllTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para outros erros, apenas rejeita
    return Promise.reject(error);
  }
);

export default api;
