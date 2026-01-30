/**
 * Room Selector Utility
 * Utilitário para seleção automática de sala
 */

import { DataCentersService } from "@/services/datacenters.service";

/**
 * Obtém o ID da primeira sala disponível para o usuário
 */
export const getDefaultRoomId = async (): Promise<string | null> => {
  try {
    const datacenters = await DataCentersService.list();
    
    if (datacenters.results.length === 0) {
      console.warn("Nenhum data center encontrado");
      return null;
    }

    const firstDatacenter = datacenters.results[0];
    const rooms = await DataCentersService.getRooms(firstDatacenter.id);

    if (rooms.length === 0) {
      console.warn("Nenhuma sala encontrada no data center");
      return null;
    }

    return rooms[0].id;
  } catch (error) {
    console.error("Erro ao buscar sala padrão:", error);
    return null;
  }
};
