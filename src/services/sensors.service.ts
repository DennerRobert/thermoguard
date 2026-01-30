/**
 * Sensors Service
 * Serviço para gerenciamento de sensores e leituras
 */

import { apiClient } from "@/lib/api-client";
import {
  Sensor,
  SensorReading,
  PaginatedResponse,
} from "@/interfaces/api-responses.interface";

export const SensorsService = {
  /**
   * Lista todos os sensores
   */
  async list(): Promise<PaginatedResponse<Sensor>> {
    console.log("🔍 SensorsService.list() - Buscando sensores em: /api/sensors/");
    const response = await apiClient.get<any>("/api/sensors/");
    console.log("📦 SensorsService.list() - Resposta recebida:", response);
    
    // Adaptar formato customizado da API {success, data, pagination}
    if (response.success && response.data) {
      console.log("✅ SensorsService.list() - Formato customizado detectado, sensores:", response.data.length);
      return {
        count: response.pagination?.count || response.data.length,
        next: response.pagination?.next || null,
        previous: response.pagination?.previous || null,
        results: response.data,
      };
    }
    
    // Fallback para formato padrão DRF
    console.log("⚠️ SensorsService.list() - Usando fallback para formato padrão");
    return response;
  },

  /**
   * Obtém as últimas leituras dos sensores
   */
  async getLatestReadings(roomId?: string): Promise<any> {
    const params = roomId ? `?room_id=${roomId}` : "";
    const response = await apiClient.get(`/api/sensors/readings/latest/${params}`);
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },

  /**
   * Obtém histórico de leituras de um sensor específico
   */
  async getSensorReadings(
    sensorId: string,
    params?: {
      start_date?: string;
      end_date?: string;
      limit?: number;
    }
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    const endpoint = `/api/sensors/${sensorId}/readings/${query ? `?${query}` : ""}`;

    console.log("🔍 SensorsService.getSensorReadings() - Endpoint:", endpoint);
    console.log("📋 SensorsService.getSensorReadings() - Params:", params);
    
    const response = await apiClient.get(endpoint);
    console.log("📦 SensorsService.getSensorReadings() - Resposta recebida:", response);
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      console.log("✅ SensorsService.getSensorReadings() - Leituras encontradas:", Array.isArray(response.data) ? response.data.length : "não é array");
      return response.data;
    }
    
    console.log("⚠️ SensorsService.getSensorReadings() - Retornando resposta direta");
    return response;
  },
};
