import { customFetch } from "@/utils/index";

export const purchaseService = {
  /**
   * Inicia o processo de compra no Stripe para um conteúdo específico
   */
  getCheckoutSession: async (contentId: string) => {
    const response = await customFetch.get(
      `purchases/checkout-session/${contentId}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  /**
   * Verifica se o utilizador logado já comprou este conteúdo
   */
  checkAccess: async (contentId: string) => {
    const response = await customFetch.get(
      `purchases/check-access/${contentId}`,
      {
        withCredentials: true,
      },
    );
    return response.data; // Retorna { status: 'success', hasAccess: true/false }
  },
};
