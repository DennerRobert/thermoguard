"use client";

import { useState, useCallback } from "react";
import { Power, PowerOff, Settings2, Radio } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";

export const ControlPanel = () => {
  const {
    setpoint,
    setSetpoint,
    mode,
    setMode,
    airConditioners,
    turnOnAirConditioner,
    turnOffAllAirConditioners,
    recordIRSignal,
  } = useThermoGuardStore();

  const [isRecording, setIsRecording] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = useCallback((buttonId: string, action: () => void) => {
    setActiveButton(buttonId);
    action();
    setTimeout(() => setActiveButton(null), 200);
  }, []);

  const handleTurnOn = () => {
    const offAc = airConditioners.find((ac) => ac.status === "off");
    if (offAc) {
      turnOnAirConditioner(offAc.id);
    }
  };

  const handleTurnOff = () => {
    turnOffAllAirConditioners();
  };

  const handleAutoMode = () => {
    setMode(mode === "automatic" ? "manual" : "automatic");
  };

  const handleRecordIR = async () => {
    setIsRecording(true);
    await recordIRSignal();
    setIsRecording(false);
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Settings2 size={18} className="text-cyan-400" />
        <span className="font-semibold text-[#f0f6fc]">Painel de Controle</span>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Ligar Ar */}
        <button
          onClick={() => handleButtonClick("on", handleTurnOn)}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${activeButton === "on"
            ? "bg-green-500/20 border-green-500/50 scale-95"
            : "bg-[#161b22] border-[#21262d] hover:border-green-500/30 hover:bg-green-500/5"
            }`}
        >
          <Power size={24} className="text-green-400" />
          <span className="text-xs font-medium text-green-400">Ligar Ar</span>
        </button>

        {/* Desligar Ar */}
        <button
          onClick={() => handleButtonClick("off", handleTurnOff)}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${activeButton === "off"
            ? "bg-red-500/20 border-red-500/50 scale-95"
            : "bg-[#161b22] border-[#21262d] hover:border-red-500/30 hover:bg-red-500/5"
            }`}
        >
          <PowerOff size={24} className="text-red-400" />
          <span className="text-xs font-medium text-red-400">Desligar Ar</span>
        </button>

        {/* Modo Automático */}
        <button
          onClick={() => handleButtonClick("auto", handleAutoMode)}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${mode === "automatic"
            ? "bg-cyan-500/20 border-cyan-500/50"
            : "bg-[#161b22] border-[#21262d] hover:border-cyan-500/30 hover:bg-cyan-500/5"
            } ${activeButton === "auto" ? "scale-95" : ""}`}
        >
          <Settings2 size={24} className="text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">
            Modo{"\n"}Automático
          </span>
        </button>

        {/* Gravar Sinal IR */}
        <button
          onClick={() => handleButtonClick("ir", handleRecordIR)}
          disabled={isRecording}
          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${isRecording
            ? "bg-orange-500/20 border-orange-500/50"
            : "bg-[#161b22] border-[#21262d] hover:border-orange-500/30 hover:bg-orange-500/5"
            } ${activeButton === "ir" ? "scale-95" : ""}`}
        >
          <Radio size={24} className={`text-orange-400 ${isRecording ? "animate-pulse" : ""}`} />
          <span className="text-xs font-medium text-orange-400">
            Gravar Sinal IR
          </span>
        </button>
      </div>

      {/* Setpoint Slider */}
      <div className="bg-[#161b22] rounded-xl p-4 border border-[#21262d]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#8b949e]">Setpoint de Temperatura</span>
          <span className="text-lg font-mono font-bold text-green-400">{setpoint}°C</span>
        </div>

        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min={18}
            max={30}
            step={1}
            value={setpoint}
            onChange={(e) => setSetpoint(parseFloat(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((setpoint - 18) / 12) * 100}%, #21262d ${((setpoint - 18) / 12) * 100}%, #21262d 100%)`,
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[#6e7681]">18°C</span>
            <span className="text-xs text-[#6e7681]">24°C</span>
            <span className="text-xs text-[#6e7681]">30°C</span>
          </div>
        </div>
      </div>

      {/* Info text */}
      <div className="mt-4 p-3 bg-[#161b22] rounded-lg border border-[#21262d]">
        <p className="text-xs text-[#6e7681] text-center">
          O ar-condicionado será acionado automaticamente quando a temperatura ultrapassar o setpoint
        </p>
      </div>
    </div>
  );
};
