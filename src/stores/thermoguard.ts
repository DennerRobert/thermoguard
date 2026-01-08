import { create } from "zustand";
import {
  ThermoGuardStore,
  ConnectionStatus,
  SensorData,
  AirConditionerMode,
  TemperatureHistoryPoint,
} from "@/types/thermoguard.interface";

export const useThermoGuardStore = create<ThermoGuardStore>((set, get) => ({
  // Initial State - valores fixos para evitar hydration mismatch
  connectionStatus: "online",
  currentTemperature: 24.5,
  currentHumidity: 48,
  setpoint: 25,
  mode: "automatic",
  airConditioners: [
    { id: "ac-01", name: "Unidade 01", status: "off", isActive: false },
    { id: "ac-02", name: "Unidade 02", status: "off", isActive: false },
    { id: "ac-03", name: "Unidade 03", status: "off", isActive: false },
  ],
  temperatureHistory: [],
  lastUpdate: null,

  // Actions
  setConnectionStatus: (status: ConnectionStatus) =>
    set({ connectionStatus: status }),

  updateSensorData: (data: SensorData) =>
    set({
      currentTemperature: data.temperature,
      currentHumidity: data.humidity,
      lastUpdate: data.timestamp,
    }),

  setSetpoint: (value: number) => {
    set({ setpoint: value });

    const state = get();
    if (state.mode === "automatic") {
      if (state.currentTemperature > value) {
        const offAc = state.airConditioners.find((ac) => ac.status === "off");
        if (offAc) {
          get().turnOnAirConditioner(offAc.id);
        }
      }
    }
  },

  setMode: (mode: AirConditionerMode) => set({ mode }),

  toggleAirConditioner: (id: string) =>
    set((state) => ({
      airConditioners: state.airConditioners.map((ac) =>
        ac.id === id
          ? {
              ...ac,
              status: ac.status === "on" ? "off" : "on",
              isActive: ac.status === "off",
            }
          : ac
      ),
    })),

  turnOnAirConditioner: (id: string) =>
    set((state) => ({
      airConditioners: state.airConditioners.map((ac) =>
        ac.id === id ? { ...ac, status: "on", isActive: true } : ac
      ),
    })),

  turnOffAirConditioner: (id: string) =>
    set((state) => ({
      airConditioners: state.airConditioners.map((ac) =>
        ac.id === id ? { ...ac, status: "off", isActive: false } : ac
      ),
    })),

  turnOffAllAirConditioners: () =>
    set((state) => ({
      airConditioners: state.airConditioners.map((ac) => ({
        ...ac,
        status: "off",
        isActive: false,
      })),
    })),

  addTemperatureHistoryPoint: (point: TemperatureHistoryPoint) =>
    set((state) => ({
      temperatureHistory: [...state.temperatureHistory.slice(-29), point],
    })),

  recordIRSignal: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("IR Signal recorded successfully");
        resolve();
      }, 2000);
    });
  },
}));
