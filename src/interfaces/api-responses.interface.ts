/**
 * API Responses Interfaces
 * Interfaces para respostas da API ThermoGuard
 */

import { User } from "./user.interface";

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ErrorResponse {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface SensorReading {
  id: string;
  sensor_id: string;
  room_id: string;
  temperature: number;
  humidity: number;
  created_at: string;
}

export interface Sensor {
  id: string;
  room: string;
  room_name: string;
  data_center_name: string;
  device_id: string;
  name: string;
  sensor_type: "temperature" | "humidity" | "both";
  sensor_type_display: string;
  is_online: boolean;
  last_seen: string | null;
  minutes_since_last_seen: number;
  created_at: string;
  updated_at: string;
}

export interface AirConditionerAPI {
  id: string;
  room: string;
  room_name: string;
  data_center_name: string;
  name: string;
  status: "on" | "off" | "error";
  status_display: string;
  is_active: boolean;
  has_ir_codes: boolean;
  esp32_device_id: string;
  last_command: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomSettings {
  id: string;
  setpoint: number;
  mode: "manual" | "automatic";
  min_temp: number;
  max_temp: number;
}

export interface DataCenter {
  id: string;
  name: string;
  location: string;
  is_active: boolean;
  room_count: number;
  active_room_count: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  datacenter: string;
  datacenter_name: string;
  name: string;
  description: string;
  is_active: boolean;
  sensor_count: number;
  ac_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  sensors: Sensor[];
  air_conditioners: AirConditionerAPI[];
  latest_readings: SensorReading[];
  active_alerts_count: number;
}

export interface TemperatureHistoryPoint {
  timestamp: string;
  temperature: number;
  humidity: number;
}
