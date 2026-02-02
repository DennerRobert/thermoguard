export type ConnectionStatus = "online" | "offline" | "connecting";

export type AirConditionerMode = "manual" | "automatic";

export type AirConditionerStatus = "on" | "off"; 

export interface AirConditionerUnit {
  id: string;
  name: string;
  status: AirConditionerStatus;
  isActive: boolean;
  room?: string;
  room_name?: string;
  esp32_device_id?: string;
  has_ir_codes?: boolean;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: Date;
}

export interface TemperatureHistoryPoint {
  time: string;
  temperature: number;
  humidity: number;
}

export interface SystemState {
  connectionStatus: ConnectionStatus;
  currentTemperature: number;
  currentHumidity: number;
  setpoint: number;
  mode: AirConditionerMode;
  airConditioners: AirConditionerUnit[];
  temperatureHistory: TemperatureHistoryPoint[];
  lastUpdate: Date | null;
  roomId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SystemActions {
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateSensorData: (data: SensorData) => void;
  setSetpoint: (value: number) => void;
  setMode: (mode: AirConditionerMode) => void;
  toggleAirConditioner: (id: string) => Promise<void>;
  turnOnAirConditioner: (id: string) => Promise<void>;
  turnOffAirConditioner: (id: string) => Promise<void>;
  turnOffAllAirConditioners: () => Promise<void>;
  addTemperatureHistoryPoint: (point: TemperatureHistoryPoint) => void;
  recordIRSignal: (id: string) => Promise<void>;
  setRoomId: (roomId: string | null) => void;
  fetchAirConditioners: () => Promise<void>;
  fetchSensorData: () => Promise<void>;
  fetchTemperatureHistory: (period?: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  updateSetpoint: (value: number) => Promise<void>;
  updateMode: (mode: AirConditionerMode) => Promise<void>;
}

export type ThermoGuardStore = SystemState & SystemActions;

export interface ControlPanelFormData {
  setpoint: number;
}




