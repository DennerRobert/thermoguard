/**
 * API Client
 * Cliente HTTP centralizado para comunicação com a API
 */

import { TokenManager } from "@/utils/token-manager";
import { APIError } from "@/utils/error-handler";

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  skipRefresh?: boolean;
}

class APIClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  }

  /**
   * Recupera o token de autenticação
   */
  private getAuthToken(): string | null {
    return TokenManager.getAccessToken();
  }

  /**
   * Tenta fazer refresh do token
   */
  private async refreshToken(): Promise<string> {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new APIError("Sem token de refresh", 401);
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        TokenManager.clearTokens();
        throw new APIError("Falha ao renovar sessão", 401);
      }

      const data = await response.json();
      TokenManager.setTokens(data.access, refreshToken);
      return data.access;
    } catch (error) {
      TokenManager.clearTokens();
      throw error;
    }
  }

  /**
   * Requisição HTTP genérica
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      requiresAuth = true,
      skipRefresh = false,
      headers = {},
      ...fetchOptions
    } = options;

    // Prepara headers
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Adiciona token de autenticação se necessário
    if (requiresAuth) {
      const token = this.getAuthToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    // Monta URL completa
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      });

      // Se 401 e não estamos fazendo refresh, tenta renovar token
      if (
        response.status === 401 &&
        requiresAuth &&
        !skipRefresh &&
        !endpoint.includes("/auth/refresh/")
      ) {
        // Se já está renovando, aguarda
        if (this.isRefreshing && this.refreshPromise) {
          await this.refreshPromise;
          return this.request<T>(endpoint, { ...options, skipRefresh: true });
        }

        // Inicia renovação
        this.isRefreshing = true;
        this.refreshPromise = this.refreshToken();

        try {
          await this.refreshPromise;
          this.isRefreshing = false;
          this.refreshPromise = null;
          
          // Tenta novamente com novo token
          return this.request<T>(endpoint, { ...options, skipRefresh: true });
        } catch (refreshError) {
          this.isRefreshing = false;
          this.refreshPromise = null;
          throw refreshError;
        }
      }

      // Trata erros HTTP
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          // Ignora erro ao parsear JSON
        }

        throw new APIError(
          errorData.detail || errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      // Se resposta é 204 No Content, retorna null
      if (response.status === 204) {
        return null as T;
      }

      // Tenta parsear JSON
      try {
        return await response.json();
      } catch {
        return null as T;
      }
    } catch (error) {
      // Se é um APIError, propaga
      if (error instanceof APIError) {
        throw error;
      }

      // Erro de rede ou outro
      throw new APIError(
        "Erro de conexão. Verifique se a API está rodando.",
        0,
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Exporta instância única
export const apiClient = new APIClient();
