import { customFetch } from "@/utils/index";

export const profileService = {
  // LISTAR: Carregar perfil completo
  getProfile: async (userId: string) => {
    const response = await customFetch.get(`profiles/${userId}`);
    return response.data;
  },

  // EDITAR: Atualizar dados básicos do perfil
  updateProfile: async (userId: string, profileData: any) => {
    const response = await customFetch.patch(`profiles/${userId}`, profileData);
    return response.data;
  },

  /** Atualizar foto de perfil (multipart, campo `photo`) */
  uploadAvatar: async (userId: string, formData: FormData) => {
    const response = await customFetch.post(
      `profiles/${userId}/avatar`,
      formData,
      {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // ADICIONAR REDE: Adicionar link social
  addSocialLink: async (userId: string, socialData: { platform: string, url: string, username: string }) => {
    const response = await customFetch.post(`profiles/${userId}/social`, socialData);
    return response.data;
  },

  // ELIMINAR REDE: Remover link social
  deleteSocialLink: async (linkId: string) => {
    const response = await customFetch.delete(`profiles/social/${linkId}`);
    return response.data;
  },

  // ELIMINAR CONTA: Desativar utilizador
  deleteAccount: async () => {
    const response = await customFetch.delete(`users/deleteMe`);
    return response.data;
  }
};