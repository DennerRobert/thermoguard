"use client";

import { Snowflake, Power } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";

export const AirConditionerStatus = () => {
  const airConditioners = useThermoGuardStore((state) => state.airConditioners);
  const toggleAirConditioner = useThermoGuardStore((state) => state.toggleAirConditioner);

  const activeCount = airConditioners.filter((ac) => ac.isActive).length;

  const unitNames: Record<string, { name: string; location: string }> = {
    "ac-01": { name: "Sala Principal", location: "Unidade 01" },
    "ac-02": { name: "Sala Backup", location: "Unidade 02" },
    "ac-03": { name: "Sala Auxiliar", location: "Unidade 03" },
  };

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Snowflake size={18} className="text-cyan-400" />
        <span className="font-semibold text-[#f0f6fc]">Ar-Condicionado</span>
      </div>

      {/* Units List */}
      <div className="space-y-3">
        {airConditioners.slice(0, 2).map((ac) => {
          const info = unitNames[ac.id] || { name: ac.name, location: ac.room_name || "Unidade" };

          return (
            <button
              key={ac.id}
              onClick={() => toggleAirConditioner(ac.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${ac.isActive
                ? "bg-cyan-500/10 border-cyan-500/30"
                : "bg-[#161b22] border-[#21262d] hover:border-[#30363d]"
                }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${ac.isActive ? "bg-cyan-500/20" : "bg-[#21262d]"
                    }`}
                >
                  <Power
                    size={18}
                    className={ac.isActive ? "text-cyan-400" : "text-[#6e7681]"}
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium text-[#f0f6fc] text-sm">{info.name}</p>
                  <p className="text-xs text-[#6e7681]">{info.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${ac.isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-[#21262d] text-[#6e7681]"
                    }`}
                >
                  {ac.isActive ? "Ativa" : "Inativa"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Count */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#21262d]">
        <span className="text-sm text-[#8b949e]">Unidades Ativas</span>
        <span className="text-sm font-mono font-bold text-green-400">
          {activeCount}/{airConditioners.length}
        </span>
      </div>
    </div>
  );
};
