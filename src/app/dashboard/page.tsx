"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { TemperatureGauge } from "@/components/temperature-gauge";
import { HumidityCard } from "@/components/humidity-card";
import { AirConditionerStatus } from "@/components/air-conditioner-status";
import { ControlPanel } from "@/components/control-panel";
import { TemperatureHistoryChart } from "@/components/temperature-history-chart";
import { useThermoGuardStore } from "@/stores/thermoguard";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const {
        startPolling,
        stopPolling,
        fetchAirConditioners,
        fetchSensorData,
        fetchTemperatureHistory,
    } = useThermoGuardStore();

    // Proteção de rota - redireciona para login se não autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Inicializa dashboard e inicia polling
    useEffect(() => {
        if (!isAuthenticated) return;

        const initializeDashboard = async () => {
            // Busca dados iniciais
            await fetchAirConditioners();
            await fetchSensorData();
            await fetchTemperatureHistory();
            
            // Inicia polling para atualizações a cada 1 minuto
            startPolling();
        };

        initializeDashboard();

        // Cleanup: para o polling ao desmontar
        return () => {
            stopPolling();
        };
    }, [isAuthenticated, startPolling, stopPolling, fetchAirConditioners, fetchSensorData, fetchTemperatureHistory]);

    // Não renderiza nada se não estiver autenticado
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0d1117]">
            <Header />

            <main className="max-w-[1400px] mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column - Temperature & Humidity + Chart */}
                    <div className="lg:col-span-9 flex flex-col space-y-6">
                        {/* Temperature & Humidity first */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TemperatureGauge />
                            <HumidityCard />
                        </div>

                        {/* Chart below - flex-1 to fill remaining space */}
                        <div className="flex-1">
                            <TemperatureHistoryChart />
                        </div>
                    </div>

                    {/* Right Column - AC Status & Controls */}
                    <div className="lg:col-span-3 space-y-6">
                        <AirConditionerStatus />
                        <ControlPanel />
                    </div>
                </div>
            </main>
        </div>
    );
}
