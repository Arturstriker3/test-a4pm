import Cookies from "js-cookie";

const COOKIE_NAME = "chefbook_auth_token";
const REFRESH_COOKIE_NAME = "chefbook_refresh_token";

const AUTH_TOKEN_EXPIRES = Number(import.meta.env.VITE_AUTH_TOKEN_EXPIRES) || 1;
const REFRESH_TOKEN_EXPIRES =
  Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRES) || 7;

const COOKIE_OPTIONS = {
  secure: true,
  sameSite: "strict" as const,
  expires: AUTH_TOKEN_EXPIRES,
  path: "/",
};

const REFRESH_COOKIE_OPTIONS = {
  secure: true,
  sameSite: "strict" as const,
  expires: REFRESH_TOKEN_EXPIRES,
  path: "/",
  httpOnly: false,
};

export const CookieService = {

  setAuthToken(token: string) {
    try {
      const options = {
        ...COOKIE_OPTIONS,
        secure: import.meta.env.PROD,
      };
      Cookies.set(COOKIE_NAME, token, options);
    } catch (error) {
      console.error("Erro ao salvar token no cookie:", error);
    }
  },

  getAuthToken(): string | null {
    try {
      return Cookies.get(COOKIE_NAME) || null;
    } catch (error) {
      console.error("Erro ao recuperar token do cookie:", error);
      return null;
    }
  },

  removeAuthToken() {
    try {
      Cookies.remove(COOKIE_NAME, { path: "/" });
    } catch (error) {
      console.error("Erro ao remover token do cookie:", error);
    }
  },

  setRefreshToken(token: string) {
    try {
      const options = {
        ...REFRESH_COOKIE_OPTIONS,
        secure: import.meta.env.PROD,
      };
      Cookies.set(REFRESH_COOKIE_NAME, token, options);
    } catch (error) {
      console.error("Erro ao salvar refresh token no cookie:", error);
    }
  },

  getRefreshToken(): string | null {
    try {
      return Cookies.get(REFRESH_COOKIE_NAME) || null;
    } catch (error) {
      console.error("Erro ao recuperar refresh token do cookie:", error);
      return null;
    }
  },

  removeRefreshToken() {
    try {
      Cookies.remove(REFRESH_COOKIE_NAME, { path: "/" });
    } catch (error) {
      console.error("Erro ao remover refresh token do cookie:", error);
    }
  },

  clearAllTokens() {
    this.removeAuthToken();
    this.removeRefreshToken();
  },
};
