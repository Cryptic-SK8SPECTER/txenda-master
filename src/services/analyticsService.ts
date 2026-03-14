import { customFetch } from "@/utils/index";

export const analyticsService = {
  getCreatorStats: async () => {
    const response = await customFetch.get(`analytics/creator-stats`, {
      withCredentials: true,
    });
    return response.data;
  }
};
