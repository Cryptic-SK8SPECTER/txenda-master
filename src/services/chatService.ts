import { customFetch } from "@/utils/index";

export const chatService = {
  /**
   * Carrega as mensagens de um chat específico com paginação
   */
  loadMessages: async (
    chatId: string,
    page: number = 1,
    limit: number = 20,
  ) => {
    const response = await customFetch.get(
      `/chats/${chatId}/messages?page=${page}&limit=${limit}&markRead=true`,
    );
    return response.data;
  },

  /**
   * Envia uma nova mensagem
   */
  sendMessage: async (
    chatId: string,
    content: string,
    attachments: string[] = [],
  ) => {
    const response = await customFetch.post(`/chats/${chatId}/messages`, {
      chatId,
      content,
      attachments,
    });
    return response.data;
  },

  /**
   * Marca mensagens como lidas
   */
  markAsRead: async (chatId: string) => {
    const response = await customFetch.patch(
      `/chats/${chatId}/mark-as-read/me`,
    );
    return response.data;
  },
  getOrCreateChat: async (recipientId: string) => {
    const response = await customFetch.post("/chats/get-or-create", {
      recipientId,
    });
    return response.data;
  },
};
