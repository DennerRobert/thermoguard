/**
 * Dashboard Service
 * Serviço para dados do dashboard
 */

import { apiClient } from "@/lib/api-client";
import {
  DashboardData,
  TemperatureHistoryPoint,
} from "@/interfaces/api-responses.interface";

export const DashboardService = {
  /**
   * Obtém dados do dashboard
   */
  async getDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get<any>("/api/dashboard/");
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },

  /**
   * Obtém histórico de temperatura
   */
  async getTemperatureHistory(
    roomId: string,
    period: "day" | "week" | "month" = "day"
  ): Promise<TemperatureHistoryPoint[]> {
    const params = `?room_id=${roomId}&period=${period}`;
    const response = await apiClient.get<any>(
      `/api/reports/temperature-history/${params}`
    );
    
    // Adaptar formato customizado da API {success, data}
    if (response && response.success && response.data) {
      return response.data;
    }
    
    return response;
  },
};
