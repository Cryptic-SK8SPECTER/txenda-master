
import { customFetch } from "@/utils/index";

export const userService = {
  // ATUALIZAR NOME, EMAIL E FOTO (Multipart/Form-Data)
  updateMe: async (formData: FormData) => {
    const response = await customFetch.patch('users/updateMe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // OBTER DADOS DO UTILIZADOR LOGADO
  getMe: async () => {
    const response = await customFetch.get('users/me');
    return response.data;
  },

  // ALTERAR SENHA (Password)
  updatePassword: async (passwordData: any) => {
    const response = await customFetch.patch('users/updateMyPassword', passwordData);
    return response.data;
  },

  // DESATIVAR CONTA (Delete Me)
  deleteMe: async () => {
    const response = await customFetch.delete('users/deleteMe');
    return response.data;
  }
};