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
    const response = await apiClient.get<any>("/api/sensors/");
    
    // Adaptar formato customizado da API {success, data, pagination}
    if (response.success && response.data) {
      return {
        count: response.pagination?.count || response.data.length,
        next: response.pagination?.next || null,
        previous: response.pagination?.previous || null,
        results: response.data,
      };
    }
    
    // Fallback para formato padrão DRF
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
    
    const response = await apiClient.get(endpoint);
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    // Se for formato padrão DRF com results
    if (response && response.results) {
      return response.results;
    }
    
    return response;
  },
};
