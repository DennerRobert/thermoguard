"use client";

import { Wifi, LogOut, User } from "lucide-react";
import { useThermoGuardStore } from "@/stores/thermoguard";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export const Header = () => {
  const router = useRouter();
  const connectionStatus = useThermoGuardStore((state) => state.connectionStatus);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [time, setTime] = useState<string>("--:--:--");
  const [date, setDate] = useState<string>("--");
  const [isClient, setIsClient] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
          <img src="/logo.svg" alt="ThermoGuard Logo" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-cyan-400">Thermo</span>
              <span className="text-orange-400">Guard</span>
            </h1>
            <p className="text-xs text-[#6e7681] text-white">Data Center Monitoring System</p>
          </div>
        </div>

        {/* Status & Clock */}
        <div className="flex items-center gap-6">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${connectionStatus === "online"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
          >
            <Wifi size={16} />
            <span>{connectionStatus === "online" ? "Online" : "Offline"}</span>
          </div>

          {/* User Info */}
          {user && (
            <div className="flex items-center gap-3 px-4 py-2 bg-[#0d1117] rounded-xl border border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-[#f0f6fc]">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#161b22] rounded-lg transition-colors group"
                title="Sair"
              >
                <LogOut size={16} className="text-[#8b949e] group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          )}

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
