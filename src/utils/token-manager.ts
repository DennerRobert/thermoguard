/**
 * Token Manager
 * Gerencia tokens JWT no localStorage
 */

const ACCESS_TOKEN_KEY = "thermoguard_access_token";
const REFRESH_TOKEN_KEY = "thermoguard_refresh_token";

export const TokenManager = {
  /**
   * Salva os tokens no localStorage
   */
  setTokens(access: string, refresh: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },

  /**
   * Recupera o access token
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Recupera o refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Remove todos os tokens
   */
  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Verifica se um token está expirado
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  },

  /**
   * Decodifica um JWT token
   */
  decodeToken(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },
};
