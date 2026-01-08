"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { TemperatureGauge } from "@/components/temperature-gauge";
import { HumidityCard } from "@/components/humidity-card";
import { AirConditionerStatus } from "@/components/air-conditioner-status";
import { ControlPanel } from "@/components/control-panel";
import { TemperatureHistoryChart } from "@/components/temperature-history-chart";
import { useThermoGuardStore } from "@/stores/thermoguard";

export default function DashboardPage() {
  const {
    updateSensorData,
    addTemperatureHistoryPoint,
    currentTemperature,
    currentHumidity,
    setpoint,
    mode,
    airConditioners,
    turnOnAirConditioner,
    turnOffAirConditioner,
  } = useThermoGuardStore();

  // Simulate real-time sensor data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const tempVariation = (Math.random() - 0.5) * 0.8;
      const humidityVariation = (Math.random() - 0.5) * 3;

      const newTemp = Math.round((currentTemperature + tempVariation) * 10) / 10;
      const newHumidity = Math.round(
        Math.max(20, Math.min(80, currentHumidity + humidityVariation))
      );

      const now = new Date();

      updateSensorData({
        temperature: newTemp,
        humidity: newHumidity,
        timestamp: now,
      });

      addTemperatureHistoryPoint({
        time: now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: newTemp,
        humidity: newHumidity,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentTemperature, currentHumidity, updateSensorData, addTemperatureHistoryPoint]);

  // Automatic mode control logic
  useEffect(() => {
    if (mode !== "automatic") return;

    const activeACs = airConditioners.filter((ac) => ac.isActive);

    if (currentTemperature > setpoint + 1 && activeACs.length < airConditioners.length) {
      const offAC = airConditioners.find((ac) => !ac.isActive);
      if (offAC) {
        turnOnAirConditioner(offAC.id);
      }
    } else if (currentTemperature < setpoint - 1 && activeACs.length > 0) {
      const onAC = activeACs[activeACs.length - 1];
      if (onAC) {
        turnOffAirConditioner(onAC.id);
      }
    }
  }, [currentTemperature, setpoint, mode, airConditioners, turnOnAirConditioner, turnOffAirConditioner]);

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Temperature & Humidity */}
          <div className="lg:col-span-3 space-y-6">
            <TemperatureGauge />
            <HumidityCard />
          </div>

          {/* Center Column - Chart */}
          <div className="lg:col-span-6">
            <TemperatureHistoryChart />
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
