"use client";

import { useMemo, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-[#1c2128] border border-[#30363d] rounded-lg p-3 shadow-xl">
      <p className="text-xs font-medium text-[#8b949e] mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-[#6e7681]">
            {entry.dataKey === "temperature" ? "Temp" : "Umid"}:
          </span>
          <span className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.value.toFixed(1)}
            {entry.dataKey === "temperature" ? "°C" : "%"}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TemperatureHistoryChart = () => {
  const temperatureHistory = useThermoGuardStore((state) => state.temperatureHistory);
  const addTemperatureHistoryPoint = useThermoGuardStore((state) => state.addTemperatureHistoryPoint);
  const [isClient, setIsClient] = useState(false);

  // Initialize history data on client side only
  useEffect(() => {
    setIsClient(true);

    if (temperatureHistory.length === 0) {
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60000);
        const baseTemp = 24;
        const tempVariation = Math.sin(i * 0.3) * 2 + Math.random() * 1.5;
        const baseHumidity = 45;
        const humidityVariation = Math.cos(i * 0.2) * 5 + Math.random() * 3;

        addTemperatureHistoryPoint({
          time: time.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: Math.round((baseTemp + tempVariation) * 10) / 10,
          humidity: Math.round(baseHumidity + humidityVariation),
        });
      }
    }
  }, []);

  const stats = useMemo(() => {
    if (temperatureHistory.length === 0) return { min: "0.0", max: "0.0", avg: "0.0" };
    const temps = temperatureHistory.map((p) => p.temperature);
    return {
      min: Math.min(...temps).toFixed(1),
      max: Math.max(...temps).toFixed(1),
      avg: (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1),
    };
  }, [temperatureHistory]);

  if (!isClient) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-cyan-400" />
          <span className="font-semibold text-[#f0f6fc]">Histórico de Temperatura</span>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <span className="text-[#6e7681]">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          <span className="font-semibold text-[#f0f6fc]">Histórico de Temperatura</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400" />
            <span className="text-xs text-[#8b949e]">Temperatura</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-[#8b949e]">Umidade</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[150px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={temperatureHistory}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#21262d"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6e7681", fontSize: 10 }}
              axisLine={{ stroke: "#21262d" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="temp"
              domain={[15, 35]}
              tick={{ fill: "#6e7681", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="humidity"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: "#6e7681", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              hide
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22d3ee", stroke: "#0d1117", strokeWidth: 2 }}
            />
            <Line
              yAxisId="humidity"
              type="monotone"
              dataKey="humidity"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e", stroke: "#0d1117", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-[#161b22] rounded-xl p-4 text-center border border-[#21262d]">
          <span className="text-xs text-[#6e7681] block mb-1">Mínima</span>
          <span className="text-lg font-mono font-bold text-cyan-400">{stats.min}°C</span>
        </div>
        <div className="bg-[#161b22] rounded-xl p-4 text-center border border-[#21262d]">
          <span className="text-xs text-[#6e7681] block mb-1">Média</span>
          <span className="text-lg font-mono font-bold text-yellow-400">{stats.avg}°C</span>
        </div>
        <div className="bg-[#161b22] rounded-xl p-4 text-center border border-[#21262d]">
          <span className="text-xs text-[#6e7681] block mb-1">Máxima</span>
          <span className="text-lg font-mono font-bold text-orange-400">{stats.max}°C</span>
        </div>
      </div>
    </div>
  );
};
