import { create } from "zustand";
import {
  ThermoGuardStore,
  ConnectionStatus,
  SensorData,
  AirConditionerMode,
  TemperatureHistoryPoint,
  AirConditionerUnit,
} from "@/types/thermoguard.interface";
import { AirConditionersService } from "@/services/air-conditioners.service";
import { SensorsService } from "@/services/sensors.service";
import { RoomsService } from "@/services/rooms.service";
import { DashboardService } from "@/services/dashboard.service";
import { getDefaultRoomId } from "@/utils/room-selector";
import { handleAPIError, getErrorMessage } from "@/utils/error-handler";

export const useThermoGuardStore = create<ThermoGuardStore>((set, get) => ({
  // Initial State
  connectionStatus: "online",
  currentTemperature: 0,
  currentHumidity: 0,
  setpoint: 25,
  mode: "automatic",
  airConditioners: [],
  temperatureHistory: [],
  lastUpdate: null,
  roomId: process.env.NEXT_PUBLIC_DEFAULT_ROOM_ID || null,
  isLoading: false,
  error: null,

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
    // A lógica automática é gerenciada pelo backend
  },

  setMode: (mode: AirConditionerMode) => set({ mode }),

  setRoomId: (roomId: string | null) => set({ roomId }),

  addTemperatureHistoryPoint: (point: TemperatureHistoryPoint) =>
    set((state) => ({
      temperatureHistory: [...state.temperatureHistory.slice(-29), point],
    })),

  // API Actions
  fetchAirConditioners: async () => {
    try {
      const response = await AirConditionersService.list();
      const acs: AirConditionerUnit[] = response.results.map((ac) => ({
        id: ac.id,
        name: ac.name,
        status: ac.status === "on" ? "on" : "off",
        isActive: ac.is_active,
        room: ac.room,
        room_name: ac.room_name,
        esp32_device_id: ac.esp32_device_id,
        has_ir_codes: ac.has_ir_codes,
      }));

      set({
        airConditioners: acs,
        connectionStatus: "online",
        error: null,
      });
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao buscar ar-condicionados:", error);
      set({
        connectionStatus: "offline",
        error: getErrorMessage(apiError),
      });
    }
  },

  fetchSensorData: async () => {
    const { roomId } = get();
    
    if (!roomId) return;
    
    try {
      const sensorsResponse = await SensorsService.list();
      const roomSensors = sensorsResponse.results.filter(
        (sensor) => sensor.room === roomId
      );

      if (roomSensors.length === 0) {
        set({ connectionStatus: "offline" });
        return;
      }

      const sensor =
        roomSensors.find((s) => s.sensor_type === "both") || roomSensors[0];

      const readings = await SensorsService.getSensorReadings(sensor.id, {
        limit: 1,
      });

      if (Array.isArray(readings) && readings.length > 0) {
        const latest = readings[0];
        const temperature = latest.temperature || 0;
        const humidity = latest.humidity || 0;

        set({
          currentTemperature: temperature,
          currentHumidity: humidity,
          lastUpdate: new Date(latest.timestamp),
          connectionStatus: sensor.is_online ? "online" : "offline",
          error: null,
        });
      } else {
        set({
          currentTemperature: 0,
          currentHumidity: 0,
          connectionStatus: "offline",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do sensor:", error);
      set({
        connectionStatus: "offline",
      });
    }
  },

  fetchTemperatureHistory: async () => {
    const { roomId } = get();
    
    if (!roomId) return;

    try {
      const sensorsResponse = await SensorsService.list();
      
      if (!sensorsResponse || !sensorsResponse.results) return;
      
      const roomSensors = sensorsResponse.results.filter(
        (sensor) => sensor.room === roomId
      );

      if (roomSensors.length === 0) return;

      const sensor =
        roomSensors.find((s) => s.sensor_type === "both") || roomSensors[0];

      const readings = await SensorsService.getSensorReadings(sensor.id, {
        limit: 30,
      });
      if (Array.isArray(readings) && readings.length > 0) {
        const history: TemperatureHistoryPoint[] = readings
          .map((reading: any) => {
            // O timestamp já vem no horário correto do servidor, apenas formatar
            const date = new Date(reading.timestamp);
            const hours = date.getUTCHours().toString().padStart(2, '0');
            const minutes = date.getUTCMinutes().toString().padStart(2, '0');
            
            return {
              time: `${hours}:${minutes}`,
              temperature: reading.temperature || 0,
              humidity: reading.humidity || 0,
            };
          })
          .reverse(); // Mais antigo para mais recente
        
        set({ temperatureHistory: history });
      } else {
        set({ temperatureHistory: [] });
      }
    } catch (error) {
      console.error("Erro ao buscar histórico de temperatura:", error);
    }
  },

  toggleAirConditioner: async (id: string) => {
    try {
      const updated = await AirConditionersService.toggle(id);
      
      set((state) => ({
        airConditioners: state.airConditioners.map((ac) =>
          ac.id === id
            ? {
                ...ac,
                status: updated.status === "on" ? "on" : "off",
                isActive: updated.is_active,
              }
            : ac
        ),
      }));
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao alternar ar-condicionado:", error);
      set({ error: getErrorMessage(apiError) });
    }
  },

  turnOnAirConditioner: async (id: string) => {
    try {
      const updated = await AirConditionersService.turnOn(id);
      
      set((state) => ({
        airConditioners: state.airConditioners.map((ac) =>
          ac.id === id
            ? {
                ...ac,
                status: "on",
                isActive: updated.is_active,
              }
            : ac
        ),
      }));
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao ligar ar-condicionado:", error);
      set({ error: getErrorMessage(apiError) });
    }
  },

  turnOffAirConditioner: async (id: string) => {
    try {
      const updated = await AirConditionersService.turnOff(id);
      
      set((state) => ({
        airConditioners: state.airConditioners.map((ac) =>
          ac.id === id
            ? {
                ...ac,
                status: "off",
                isActive: updated.is_active,
              }
            : ac
        ),
      }));
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao desligar ar-condicionado:", error);
      set({ error: getErrorMessage(apiError) });
    }
  },

  turnOffAllAirConditioners: async () => {
    try {
      await AirConditionersService.turnOffAll();
      
      set((state) => ({
        airConditioners: state.airConditioners.map((ac) => ({
          ...ac,
          status: "off" as const,
          isActive: false,
        })),
      }));
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao desligar todos os ar-condicionados:", error);
      set({ error: getErrorMessage(apiError) });
    }
  },

  recordIRSignal: async (id: string) => {
    try {
      await AirConditionersService.recordIR(id);
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao gravar sinal IR:", error);
      set({ error: getErrorMessage(apiError) });
      throw error;
    }
  },

  updateSetpoint: async (value: number) => {
    const { roomId } = get();
    
    if (!roomId) {
      set({ setpoint: value });
      return;
    }

    try {
      await RoomsService.updateSettings(roomId, { setpoint: value });
      set({ setpoint: value });
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao atualizar setpoint:", error);
      set({ error: getErrorMessage(apiError) });
    }
  },

  updateMode: async (mode: AirConditionerMode) => {
    const { roomId } = get();
    
    if (!roomId) {
      set({ mode });
      return;
    }

    try {
      await RoomsService.updateSettings(roomId, { mode });
      set({ mode });
    } catch (error) {
      const apiError = handleAPIError(error);
      console.error("Erro ao atualizar modo:", error);
      set({ error: getErrorMessage(apiError) });
    }
  },

  // Polling - DESABILITADO temporariamente para evitar rate limit
  startPolling: () => {
    const state = get();
    
    // Busca roomId se não tiver
    if (!state.roomId) {
      // Tenta usar o roomId da variável de ambiente primeiro
      const envRoomId = process.env.NEXT_PUBLIC_DEFAULT_ROOM_ID;
      
      if (envRoomId) {
        set({ roomId: envRoomId });
        get().fetchAirConditioners();
        get().fetchSensorData();
        get().fetchTemperatureHistory();
      } else {
        // Fallback: tenta buscar da API
        getDefaultRoomId().then((roomId) => {
          if (roomId) {
            set({ roomId });
            get().fetchAirConditioners();
            get().fetchSensorData();
            get().fetchTemperatureHistory();
          } else {
            console.error("Não foi possível obter roomId. Defina NEXT_PUBLIC_DEFAULT_ROOM_ID no .env.local");
          }
        }).catch((error) => {
          console.error("Erro ao buscar roomId da API:", error);
        });
      }
    }

    // Inicia polling de 1 minuto (60 segundos) - Sincronizado com leituras do sensor
    const interval = setInterval(() => {
      get().fetchSensorData();
      get().fetchAirConditioners();
      get().fetchTemperatureHistory();
    }, 60000); // 60000ms = 1 minuto
    
    // Armazena o interval para poder limpar depois
    (get() as any).pollingInterval = interval;
  },

  stopPolling: () => {
    const interval = (get() as any).pollingInterval;
    if (interval) {
      clearInterval(interval);
      (get() as any).pollingInterval = null;
    }
  },
}));
