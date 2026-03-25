import { customFetch } from "@/utils/index";

export const userService = {
  // ATUALIZAR NOME, EMAIL E FOTO (Multipart/Form-Data)
  updateMe: async (formData: FormData) => {
    const response = await customFetch.patch("users/updateMe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // OBTER DADOS DO UTILIZADOR LOGADO
  getMe: async () => {
    const response = await customFetch.get("users/me");
    return response.data;
  },

  // ALTERAR SENHA (Password)
  updatePassword: async (passwordData: any) => {
    const response = await customFetch.patch(
      "users/updateMyPassword",
      passwordData,
    );
    return response.data;
  },

  // DESATIVAR CONTA (soft: active = false)
  deleteMe: async () => {
    const response = await customFetch.delete("users/deleteMe");
    return response.data;
  },

  reactivateMe: async () => {
    const response = await customFetch.patch("users/reactivateMe");
    return response.data;
  },

  /** Criador: apaga todos os conteúdos + ficheiros; todos: active = false */
  deleteAccountPermanent: async () => {
    const response = await customFetch.delete("users/deleteAccountPermanent");
    return response.data;
  },

  getAllUsers: async (role = "creator", limit = 6) => {
    // Isso gera: /users?role=creator&limit=4
    const response = await customFetch.get(`users`, {
      params: { role, limit },
    });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await customFetch.get(`users/${id}`);
    return response.data;
  },
};
