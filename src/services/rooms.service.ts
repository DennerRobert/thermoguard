/**
 * Rooms Service
 * Serviço para gerenciamento de salas
 */

import { apiClient } from "@/lib/api-client";
import { RoomSettings } from "@/interfaces/api-responses.interface";

export const RoomsService = {
  /**
   * Obtém configurações de uma sala
   */
  async getSettings(roomId: string): Promise<RoomSettings> {
    const response = await apiClient.get<any>(`/api/rooms/${roomId}/settings/`);
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },

  /**
   * Atualiza configurações de uma sala
   */
  async updateSettings(
    roomId: string,
    data: Partial<RoomSettings>
  ): Promise<RoomSettings> {
    const response = await apiClient.patch<any>(
      `/api/rooms/${roomId}/settings/`,
      data
    );
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
};
