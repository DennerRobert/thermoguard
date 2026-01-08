"use client";

import { Thermometer, Wifi } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";
import { useState, useEffect } from "react";

export const Header = () => {
  const connectionStatus = useThermoGuardStore((state) => state.connectionStatus);
  const [time, setTime] = useState<string>("--:--:--");
  const [date, setDate] = useState<string>("--");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#161b22] border-b border-[#30363d] px-6 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <Thermometer size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-cyan-400">Thermo</span>
              <span className="text-orange-400">Guard</span>
              <span className="text-[#8b949e]"> IoT</span>
            </h1>
            <p className="text-xs text-[#6e7681]">Data Center Monitoring System</p>
          </div>
        </div>

        {/* Status & Clock */}
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              connectionStatus === "online"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            <Wifi size={16} />
            <span>{connectionStatus === "online" ? "Online" : "Offline"}</span>
          </div>

          {/* Clock */}
          <div className="text-right" suppressHydrationWarning>
            <div className="text-2xl font-mono font-bold text-[#f0f6fc] tracking-wider">
              {isClient ? time : "--:--:--"}
            </div>
            <div className="text-xs text-[#6e7681] capitalize">
              {isClient ? date : "--"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
