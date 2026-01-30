/**
 * Authentication Service
 * Serviço para autenticação de usuários
 */

import { apiClient } from "@/lib/api-client";
import { LoginResponse } from "@/interfaces/api-responses.interface";
import { User } from "@/interfaces/user.interface";

export const AuthService = {
  /**
   * Faz login do usuário
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<any>(
      "/api/auth/login/",
      { email, password },
      { requiresAuth: false }
    );
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },

  /**
   * Faz logout do usuário
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout/", {});
    } catch (error) {
      // Ignora erros de logout
      console.error("Erro ao fazer logout:", error);
    }
  },

  /**
   * Renova o access token usando o refresh token
   */
  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await apiClient.post<any>(
      "/api/auth/refresh/",
      { refresh },
      { requiresAuth: false }
    );
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },

  /**
   * Obtém dados do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>("/api/auth/me/");
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
};
