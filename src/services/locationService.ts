import { customFetch } from "@/utils/index";

export const locationService = {
  /**
   * 1. Atualiza a localização geográfica do utilizador logado no servidor
   * Envia longitude e latitude para o GeoJSON do MongoDB
   */
  updateMyLocation: async (
    longitude: number,
    latitude: number,
    isOnline: boolean = true,
  ) => {
    const response = await customFetch.post("locations/update-me", {
      longitude,
      latitude,
      isOnline,
    });
    return response.data;
  },

  /**
   * 2. Procura utilizadores próximos num determinado raio (km)
   * @param distance Distância em km (ex: 5)
   * @param lat Latitude atual
   * @param lng Longitude atual
   */
  getNearbyUsers: async (
    distance: number,
    lat: number,
    lng: number,
    limit: number = 5,
    page: number = 1,
  ) => {
    const response = await customFetch.get(
      `locations/nearby/${distance}/center/${lat},${lng}?limit=${limit}&page=${page}`,
    );
    return response.data;
  },

  /**
   * 3. Obtém a última localização registada de um utilizador específico
   */
  getUserLocation: async (userId: string) => {
    const response = await customFetch.get(`locations/user/${userId}`);
    return response.data;
  },
};
