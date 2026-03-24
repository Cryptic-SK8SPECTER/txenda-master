import { customFetch } from "@/utils/index";

export const contentService = {
  // Criar novo conteúdo (Upload)
  createContent: async (formData: FormData) => {
    const response = await customFetch.post("contents", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Listar conteúdos do criador logado
  getMyContents: async (page: number = 1, limit: number = 6) => {
    const response = await customFetch.get(
      `contents/my-contents?page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  },

  // Apagar conteúdo
  deleteContent: async (id: string) => {
    const response = await customFetch.delete(`contents/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // services/contentService.ts
  updateContent: async (id: string, data: any) => {
    // O customFetch identifica automaticamente se é FormData ou JSON
    const response = await customFetch.patch(`contents/${id}`, data);
    return response.data;
  },

  // Incrementar visualizações de um conteúdo específico
  incrementViews: async (id: string) => {
    const response = await customFetch.post(`contents/${id}/view`);
    return response.data;
  },

  getAllContents: async (page = 1, limit = 12, filters?: any) => {
    let url = `contents?page=${page}&limit=${limit}`;

    // Adicionar parâmetros de filtro na URL se existirem
    if (filters) {
      if (
        filters.priceRange &&
        (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 100000)
      ) {
        url += `&minPrice=${filters.priceRange[0]}&maxPrice=${filters.priceRange[1]}`;
      }

      if (
        filters.contentType &&
        filters.contentType.toLowerCase() !== "ambos"
      ) {
        const typeMap: Record<string, string> = {
          fotos: "photo",
          vídeos: "video",
        };
        const targetType = typeMap[filters.contentType.toLowerCase()];
        if (targetType) url += `&type=${targetType}`;
      }

      if (filters.categories && filters.categories.length > 0) {
        url += `&categories=${filters.categories.join(",")}`;
      }

      if (filters.searchTerm) {
        url += `&search=${encodeURIComponent(filters.searchTerm)}`;
      }

      if (filters.contentDate) {
        url += `&contentDate=${encodeURIComponent(filters.contentDate)}`;
      }

      if (filters.quickFilters?.includes("Conteúdo Premium")) {
        url += `&premiumOnly=true`;
      }

      if (filters.popularity && filters.popularity.length > 0) {
        const popularityMap: Record<string, string> = {
          "Mais visualizados": "views",
          "Mais bem avaliados": "rating",
          "Novos membros": "newest",
          "Mais ativos": "active",
        };
        const sortBy = popularityMap[filters.popularity[0]];
        if (sortBy) url += `&sortBy=${sortBy}`;
      }

      if (filters.creatorRating) {
        url += `&creatorRating=${encodeURIComponent(filters.creatorRating)}`;
      }
    }

    const response = await customFetch.get(url);
    return response.data;
  },
};
