/**
 * Air Conditioners Service
 * Serviço para controle de ar-condicionados
 */

import { apiClient } from "@/lib/api-client";
import {
  AirConditionerAPI,
  PaginatedResponse,
} from "@/interfaces/api-responses.interface";

export const AirConditionersService = {
  /**
   * Lista todos os ar-condicionados
   */
  async list(): Promise<PaginatedResponse<AirConditionerAPI>> {
    const response = await apiClient.get<any>("/api/air-conditioners/");
    
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
   * Obtém um ar-condicionado específico
   */
  async get(id: string): Promise<AirConditionerAPI> {
    const response = await apiClient.get<any>(`/api/air-conditioners/${id}/`);
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },

  /**
   * Liga um ar-condicionado
   */
  async turnOn(id: string): Promise<AirConditionerAPI> {
    const response = await apiClient.post<any>(
      `/api/air-conditioners/${id}/turn_on/`,
      {}
    );
    return response?.data || response;
  },

  /**
   * Desliga um ar-condicionado
   */
  async turnOff(id: string): Promise<AirConditionerAPI> {
    const response = await apiClient.post<any>(
      `/api/air-conditioners/${id}/turn_off/`,
      {}
    );
    return response?.data || response;
  },

  /**
   * Alterna estado do ar-condicionado (on/off)
   */
  async toggle(id: string): Promise<AirConditionerAPI> {
    const response = await apiClient.post<any>(
      `/api/air-conditioners/${id}/toggle/`,
      {}
    );
    return response?.data || response;
  },

  /**
   * Desliga todos os ar-condicionados
   */
  async turnOffAll(): Promise<void> {
    return apiClient.post<void>("/api/air-conditioners/turn-off-all/", {});
  },

  /**
   * Inicia gravação de sinal IR
   */
  async recordIR(id: string): Promise<void> {
    return apiClient.post<void>(`/api/air-conditioners/${id}/record-ir/`, {});
  },
};
