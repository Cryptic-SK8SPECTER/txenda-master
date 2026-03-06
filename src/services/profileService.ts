import { customFetch } from "@/utils/index";

export const profileService = {
  // LISTAR: Carregar perfil completo
  getProfile: async (userId: string) => {
    const response = await customFetch.get(`profile/${userId}`);
    return response.data;
  },

  // EDITAR: Atualizar dados básicos do perfil
  updateProfile: async (userId: string, profileData: any) => {
    const response = await customFetch.patch(`profile/${userId}`, profileData);
    return response.data;
  },

  // ADICIONAR REDE: Adicionar link social
  addSocialLink: async (userId: string, socialData: { platform: string, url: string, username: string }) => {
    const response = await customFetch.post(`profile/${userId}/social`, socialData);
    return response.data;
  },

  // ELIMINAR REDE: Remover link social
  deleteSocialLink: async (linkId: string) => {
    const response = await customFetch.delete(`profile/social/${linkId}`);
    return response.data;
  },

  // ELIMINAR CONTA: Desativar utilizador
  deleteAccount: async () => {
    const response = await customFetch.delete(`users/deleteMe`);
    return response.data;
  }
};