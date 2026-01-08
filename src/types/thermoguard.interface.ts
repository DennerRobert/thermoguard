export type ConnectionStatus = "online" | "offline" | "connecting";

export type AirConditionerMode = "manual" | "automatic";

export type AirConditionerStatus = "on" | "off";

export interface AirConditionerUnit {
  id: string;
  name: string;
  status: AirConditionerStatus;
  isActive: boolean;
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
}

export interface SystemActions {
  setConnectionStatus: (status: ConnectionStatus) => void;
  updateSensorData: (data: SensorData) => void;
  setSetpoint: (value: number) => void;
  setMode: (mode: AirConditionerMode) => void;
  toggleAirConditioner: (id: string) => void;
  turnOnAirConditioner: (id: string) => void;
  turnOffAirConditioner: (id: string) => void;
  turnOffAllAirConditioners: () => void;
  addTemperatureHistoryPoint: (point: TemperatureHistoryPoint) => void;
  recordIRSignal: () => Promise<void>;
}

export type ThermoGuardStore = SystemState & SystemActions;

export interface ControlPanelFormData {
  setpoint: number;
}




