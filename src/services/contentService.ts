import { customFetch } from "@/utils/index";

const API_URL = 'http://localhost:9000/api/v1/contents';

export const contentService = {
  // Criar novo conteúdo (Upload)
  createContent: async (formData: FormData) => {
    const response = await customFetch.post(API_URL, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Listar conteúdos do criador logado
  getMyContents: async () => {
    const response = await customFetch.get(`${API_URL}/my-contents`, {
      withCredentials: true
    });
    return response.data;
  },

  // Apagar conteúdo
  deleteContent: async (id: string) => {
    const response = await customFetch.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  },

  // services/contentService.ts
  updateContent: async (id: string, data: any) => {
    // O customFetch identifica automaticamente se é FormData ou JSON
    const response = await customFetch.patch(`contents/${id}`, data);
    return response.data;
  },

  getAllContents: async (page = 1, limit = 12) => {
    const response = await customFetch.get(`contents?page=${page}&limit=${limit}`);
    return response.data;
  },
};

