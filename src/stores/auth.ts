import { create } from "zustand";
import { User } from "@/interfaces/user.interface";

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

// Credenciais mocadas para teste
const MOCK_USER = {
    id: "1",
    email: "admin@thermoguard.com",
    name: "Administrador",
};

const MOCK_PASSWORD = "admin123";

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,

    login: async (email: string, password: string) => {
        // Simula delay de API
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Validação mocada
        if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
            set({
                isAuthenticated: true,
                user: MOCK_USER,
            });
            return true;
        }

        return false;
    },

    logout: () => {
        set({
            isAuthenticated: false,
            user: null,
        });
    },
}));
