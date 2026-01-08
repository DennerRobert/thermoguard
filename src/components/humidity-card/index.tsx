"use client";

import { Droplets } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";

export const HumidityCard = () => {
  const currentHumidity = useThermoGuardStore((state) => state.currentHumidity);

  const isIdeal = currentHumidity >= 30 && currentHumidity <= 70;
  const status = isIdeal ? "Ideal" : currentHumidity < 30 ? "Baixa" : "Alta";
  const statusColor = isIdeal ? "text-green-400" : "text-yellow-400";

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Droplets size={18} className="text-cyan-400" />
        <span className="font-semibold text-[#f0f6fc]">Umidade</span>
      </div>

      {/* Water Tank Visualization */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-44">
          {/* Tank outline */}
          <svg viewBox="0 0 100 140" className="w-full h-full">
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <clipPath id="tankClip">
                <rect x="10" y="10" width="80" height="120" rx="8" />
              </clipPath>
            </defs>

            {/* Tank background */}
            <rect
              x="10"
              y="10"
              width="80"
              height="120"
              rx="8"
              fill="#21262d"
              stroke="#30363d"
              strokeWidth="2"
            />

            {/* Water fill */}
            <g clipPath="url(#tankClip)">
              <rect
                x="10"
                y={130 - (currentHumidity / 100) * 120}
                width="80"
                height={(currentHumidity / 100) * 120}
                fill="url(#waterGradient)"
                className="transition-all duration-700 ease-out"
              />
              
              {/* Wave effect */}
              <ellipse
                cx="50"
                cy={130 - (currentHumidity / 100) * 120}
                rx="40"
                ry="4"
                fill="#67e8f9"
                opacity="0.5"
                className="transition-all duration-700 ease-out"
              />
            </g>
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold font-mono text-[#f0f6fc]">
              {currentHumidity}
            </span>
            <span className="text-lg text-[#8b949e]">%</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-[#21262d]">
          <span className="text-sm text-[#8b949e]">Status</span>
          <span className={`text-sm font-semibold ${statusColor}`}>{status}</span>
        </div>

        {/* Ideal range */}
        <div className="text-center mt-3">
          <span className="text-xs text-[#6e7681]">Faixa ideal: 30% - 70%</span>
        </div>
      </div>
    </div>
  );
};
