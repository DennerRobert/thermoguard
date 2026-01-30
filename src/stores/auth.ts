import { create } from "zustand";
import { User } from "@/interfaces/user.interface";
import { AuthService } from "@/services/auth.service";
import { TokenManager } from "@/utils/token-manager";
import { handleAPIError, getErrorMessage } from "@/utils/error-handler";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await AuthService.login(email, password);
      
      // Salva tokens
      TokenManager.setTokens(response.access, response.refresh);
      
      set({
        isAuthenticated: true,
        user: response.user,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const apiError = handleAPIError(error);
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: getErrorMessage(apiError),
      });

      return false;
    }
  },

  logout: async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      TokenManager.clearTokens();
      set({
        isAuthenticated: false,
        user: null,
        error: null,
      });
    }
  },

  refreshAuth: async () => {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await AuthService.refreshToken(refreshToken);
      TokenManager.setTokens(response.access, refreshToken);
      
      // Busca dados atualizados do usuário
      const user = await AuthService.getCurrentUser();
      set({
        isAuthenticated: true,
        user,
        error: null,
      });
    } catch (error) {
      TokenManager.clearTokens();
      set({
        isAuthenticated: false,
        user: null,
      });
    }
  },

  checkAuth: () => {
    const token = TokenManager.getAccessToken();
    
    if (token && !TokenManager.isTokenExpired(token)) {
      set({ isAuthenticated: true });
    } else {
      TokenManager.clearTokens();
      set({ isAuthenticated: false, user: null });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
