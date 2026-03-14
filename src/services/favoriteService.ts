import { customFetch } from "@/utils/index";

export const favoriteService = {
  loadFavorites: async () => {
    return await customFetch.get(`favorites`, {
      withCredentials: true,
    });
  },

  addToFavorites: async (targetId: string) => {
    return await customFetch.post(
      `favorites`,
      {
        targetId: targetId,
        targetType: "User",
        category: "Geral",
      },
      { withCredentials: true },
    );
  },
  removeFavorite: async (favoriteId: string) => {
    return await customFetch.delete(`favorites/${favoriteId}`, {
      withCredentials: true,
    });
  },

  // Filtrar por categoria
  getByCategory: async (userId: string, category: string) => {
    return await customFetch.get(`favorites/${userId}/category/${category}`, {
      withCredentials: true,
    });
  },
};
