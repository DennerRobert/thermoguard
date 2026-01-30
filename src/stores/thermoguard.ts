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
    
    console.log("🚀 [fetchSensorData] INICIANDO");
    console.log("🏠 [fetchSensorData] roomId:", roomId);
    
    if (!roomId) {
      console.log("⚠️ [fetchSensorData] roomId não definido - ABORTANDO");
      return;
    }
    
    try {
      console.log("🔍 [fetchSensorData] Buscando sensores da sala:", roomId);
      
      const sensorsResponse = await SensorsService.list();
      console.log("📦 [fetchSensorData] Sensores recebidos:", sensorsResponse);
      
      const roomSensors = sensorsResponse.results.filter(
        (sensor) => sensor.room === roomId
      );
      console.log("🏠 [fetchSensorData] Sensores da sala:", roomSensors.length);

      if (roomSensors.length === 0) {
        console.log("⚠️ [fetchSensorData] Nenhum sensor encontrado na sala - OFFLINE");
        set({ connectionStatus: "offline" });
        return;
      }

      const sensor =
        roomSensors.find((s) => s.sensor_type === "both") || roomSensors[0];
      
      console.log("✅ [fetchSensorData] Sensor selecionado:", sensor.id, "| Online:", sensor.is_online);

      const readings = await SensorsService.getSensorReadings(sensor.id, {
        limit: 1,
      });
      console.log("📦 [fetchSensorData] Leituras recebidas:", readings);

      if (Array.isArray(readings) && readings.length > 0) {
        const latest = readings[0];
        const temperature = latest.temperature || 0;
        const humidity = latest.humidity || 0;
        
        console.log("✅ [fetchSensorData] Leitura processada:", { temperature, humidity });

        set({
          currentTemperature: temperature,
          currentHumidity: humidity,
          lastUpdate: new Date(latest.created_at),
          connectionStatus: sensor.is_online ? "online" : "offline",
          error: null,
        });
        console.log("✅ [fetchSensorData] Estado atualizado com sucesso!");
      } else {
        console.log("⚠️ [fetchSensorData] Nenhuma leitura encontrada - OFFLINE");
        set({
          currentTemperature: 0,
          currentHumidity: 0,
          connectionStatus: "offline",
        });
      }
    } catch (error) {
      console.error("❌ [fetchSensorData] ERRO:", error);
      console.error("❌ [fetchSensorData] Stack:", error instanceof Error ? error.stack : "N/A");
      set({
        connectionStatus: "offline",
      });
    }
    
    console.log("🏁 [fetchSensorData] CONCLUÍDO");
  },

  fetchTemperatureHistory: async () => {
    const { roomId } = get();
    
    console.log("🚀 [fetchTemperatureHistory] INICIANDO");
    console.log("🏠 [fetchTemperatureHistory] roomId:", roomId);
    
    if (!roomId) {
      console.log("⚠️ [fetchTemperatureHistory] roomId não definido - ABORTANDO");
      return;
    }

    try {
      console.log("🔍 [fetchTemperatureHistory] Buscando sensores da sala:", roomId);
      
      const sensorsResponse = await SensorsService.list();
      console.log("📦 [fetchTemperatureHistory] Sensores recebidos:", sensorsResponse);
      
      if (!sensorsResponse || !sensorsResponse.results) {
        console.error("❌ [fetchTemperatureHistory] Resposta de sensores inválida:", sensorsResponse);
        return;
      }
      
      const roomSensors = sensorsResponse.results.filter(
        (sensor) => sensor.room === roomId
      );
      console.log("🏠 [fetchTemperatureHistory] Sensores da sala:", roomSensors.length);

      if (roomSensors.length === 0) {
        console.log("⚠️ [fetchTemperatureHistory] Nenhum sensor encontrado na sala - ABORTANDO");
        return;
      }

      const sensor =
        roomSensors.find((s) => s.sensor_type === "both") || roomSensors[0];
      console.log("✅ [fetchTemperatureHistory] Sensor selecionado:", sensor.id, "| Nome:", sensor.name);

      const readings = await SensorsService.getSensorReadings(sensor.id, {
        limit: 30,
      });
      console.log("📦 [fetchTemperatureHistory] Leituras recebidas:", readings);

      if (Array.isArray(readings) && readings.length > 0) {
        const history: TemperatureHistoryPoint[] = readings
          .map((reading: any) => ({
            time: new Date(reading.created_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            temperature: reading.temperature || 0,
            humidity: reading.humidity || 0,
          }))
          .reverse(); // Mais antigo para mais recente

        console.log("✅ [fetchTemperatureHistory] Histórico processado:", history.length, "pontos");
        if (history.length > 0) {
          console.log("📈 [fetchTemperatureHistory] Primeira leitura:", history[0]);
          console.log("📈 [fetchTemperatureHistory] Última leitura:", history[history.length - 1]);
        }
        
        set({ temperatureHistory: history });
        console.log("✅ [fetchTemperatureHistory] Estado atualizado!");
      } else {
        console.log("⚠️ [fetchTemperatureHistory] Nenhuma leitura encontrada");
        set({ temperatureHistory: [] });
      }
    } catch (error) {
      console.error("❌ [fetchTemperatureHistory] ERRO:", error);
      console.error("❌ [fetchTemperatureHistory] Stack:", error instanceof Error ? error.stack : "N/A");
    }
    
    console.log("🏁 [fetchTemperatureHistory] CONCLUÍDO");
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
      console.log("Sinal IR gravado com sucesso");
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
        console.log("✅ Usando roomId do ambiente:", envRoomId);
        set({ roomId: envRoomId });
        get().fetchAirConditioners();
        get().fetchSensorData();
        get().fetchTemperatureHistory();
      } else {
        // Fallback: tenta buscar da API
        console.log("⚠️ RoomId não definido no ambiente, tentando buscar da API...");
        getDefaultRoomId().then((roomId) => {
          if (roomId) {
            console.log("✅ RoomId obtido da API:", roomId);
            set({ roomId });
            get().fetchAirConditioners();
            get().fetchSensorData();
            get().fetchTemperatureHistory();
          } else {
            console.error("❌ Não foi possível obter roomId. Defina NEXT_PUBLIC_DEFAULT_ROOM_ID no .env.local");
          }
        }).catch((error) => {
          console.error("❌ Erro ao buscar roomId da API:", error);
        });
      }
    } else {
      console.log("✅ RoomId já definido:", state.roomId);
    }

    // POLLING DESABILITADO - Evitar rate limit
    // TODO: Reativar quando rate limit for ajustado no backend
    console.log("⏸️ Polling desabilitado temporariamente");
    
    // // Inicia polling de 5 minutos (300 segundos) - AUMENTADO para evitar rate limit
    // const interval = setInterval(() => {
    //   get().fetchSensorData();
    //   get().fetchAirConditioners();
    //   get().fetchTemperatureHistory();
    // }, 300000); // 300000ms = 5 minutos
    // 
    // // Armazena o interval para poder limpar depois
    // (get() as any).pollingInterval = interval;
  },

  stopPolling: () => {
    const interval = (get() as any).pollingInterval;
    if (interval) {
      clearInterval(interval);
      (get() as any).pollingInterval = null;
    }
  },
}));
