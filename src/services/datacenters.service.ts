/**
 * Data Centers Service
 * Serviço para gerenciamento de data centers
 */

import { apiClient } from "@/lib/api-client";
import {
  DataCenter,
  Room,
  PaginatedResponse,
} from "@/interfaces/api-responses.interface";

export const DataCentersService = {
  /**
   * Lista todos os data centers
   */
  async list(): Promise<PaginatedResponse<DataCenter>> {
    const response = await apiClient.get<any>("/api/datacenters/");
    
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
   * Obtém salas de um data center
   */
  async getRooms(datacenterId: string): Promise<Room[]> {
    const response = await apiClient.get<any>(
      `/api/datacenters/${datacenterId}/rooms/`
    );
    
    // Adaptar formato customizado da API
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback: array direto ou objeto com rooms
    return Array.isArray(response) ? response : response.rooms || [];
  },
};
