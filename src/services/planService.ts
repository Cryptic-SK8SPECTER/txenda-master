import { customFetch } from "@/utils/index";

export const planService = {
  // Lista todos os planos disponíveis
  getAllPlans: async () => {
    const response = await customFetch.get("plans", {
      withCredentials: true,
    });
    return response.data;
  },
};
