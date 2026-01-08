"use client";

import { Thermometer, Minus } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";

export const TemperatureGauge = () => {
  const currentTemperature = useThermoGuardStore((state) => state.currentTemperature);
  const setpoint = useThermoGuardStore((state) => state.setpoint);

  const minTemp = 15;
  const maxTemp = 40;
  const range = maxTemp - minTemp;
  const percentage = ((currentTemperature - minTemp) / range) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  // SVG Arc calculations
  const radius = 90;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius; // Semi-circle
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Setpoint position on arc
  const setpointPercentage = ((setpoint - minTemp) / range) * 100;
  const setpointAngle = (setpointPercentage / 100) * 180;
  const setpointRadians = (setpointAngle - 180) * (Math.PI / 180);
  const setpointX = 100 + normalizedRadius * Math.cos(setpointRadians);
  const setpointY = 95 + normalizedRadius * Math.sin(setpointRadians);

  // Status
  const isNormal = currentTemperature <= setpoint + 2;
  const status = isNormal ? "Normal" : currentTemperature <= setpoint + 5 ? "Alerta" : "Crítico";
  const statusColor = isNormal ? "text-green-400" : currentTemperature <= setpoint + 5 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Thermometer size={18} className="text-cyan-400" />
          <span className="font-semibold text-[#f0f6fc]">Temperatura</span>
        </div>
        <button className="text-[#6e7681] hover:text-[#8b949e] transition-colors">
          <Minus size={18} />
        </button>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative w-[200px] h-[120px]">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 15 95 A 85 85 0 0 1 185 95"
              fill="none"
              stroke="#21262d"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#67e8f9" />
              </linearGradient>
            </defs>

            {/* Progress arc */}
            <path
              d="M 15 95 A 85 85 0 0 1 185 95"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
              style={{
                filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.4))",
              }}
            />

            {/* Setpoint marker */}
            <circle
              cx={setpointX}
              cy={setpointY}
              r="6"
              fill="#22c55e"
              stroke="#0d1117"
              strokeWidth="2"
            />
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-5xl font-bold font-mono text-cyan-300 tracking-tight">
              {currentTemperature.toFixed(1)}
            </span>
            <span className="text-lg text-[#6e7681]">°C</span>
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between w-full px-2 mt-2">
          <span className="text-xs text-[#6e7681]">{minTemp}°C</span>
          <span className="text-xs text-green-400">Setpoint: {setpoint}°C</span>
          <span className="text-xs text-[#6e7681]">{maxTemp}°C</span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-[#21262d]">
          <span className="text-sm text-[#8b949e]">Status</span>
          <span className={`text-sm font-semibold ${statusColor}`}>{status}</span>
        </div>
      </div>
    </div>
  );
};
