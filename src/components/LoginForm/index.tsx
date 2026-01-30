"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { loginSchema } from "@/schemas/login.schema";

export const LoginForm = () => {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        clearError();

        // Validação com Zod
        const result = loginSchema.safeParse({ email, password });

        if (!result.success) {
            const fieldErrors: { email?: string; password?: string } = {};
            result.error.issues.forEach((error) => {
                if (error.path[0] === "email") {
                    fieldErrors.email = error.message;
                } else if (error.path[0] === "password") {
                    fieldErrors.password = error.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        // Tentar fazer login
        const success = await login(email, password);

        if (success) {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-[#0d1117] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo e Título */}
                <div className="text-center mb-8">
                    <img src="/logo.svg" alt="ThermoGuard Logo" className="w-32 h-32 mx-auto mb-6 object-contain" />
                    <h1 className="text-3xl font-bold text-[#f0f6fc] mb-2">ThermoGuard</h1>
                    <p className="text-[#8b949e]">Sistema de Monitoramento Térmico</p>
                </div>

                {/* Formulário */}
                <div className="card p-8">
                    <h2 className="text-xl font-semibold text-[#f0f6fc] mb-6">Entrar no Sistema</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-[#8b949e] mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-[#6e7681]" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 bg-[#161b22] border ${errors.email ? "border-red-500" : "border-[#30363d]"
                                        } rounded-xl text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-cyan-500 transition-colors`}
                                    placeholder="seu@email.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-[#8b949e] mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-[#6e7681]" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-3 bg-[#161b22] border ${errors.password ? "border-red-500" : "border-[#30363d]"
                                        } rounded-xl text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-cyan-500 transition-colors`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Erro de login */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <p className="text-sm text-red-400 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Botão de submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>

                    {/* Credenciais de teste */}
                    <div className="mt-6 p-4 bg-[#161b22] rounded-xl border border-[#30363d]">
                        <p className="text-xs text-[#6e7681] mb-2 font-medium">Credenciais de teste:</p>
                        <p className="text-xs text-[#8b949e]">
                            <span className="text-cyan-400">Email:</span> admin@admin.com
                        </p>
                        <p className="text-xs text-[#8b949e]">
                            <span className="text-cyan-400">Senha:</span> admin
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
