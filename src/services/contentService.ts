import axios from 'axios';

const API_URL = 'http://localhost:9000/api/v1/contents';

export const contentService = {
  // Criar novo conteúdo (Upload)
  createContent: async (formData: FormData) => {
    const response = await axios.post(API_URL, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Listar conteúdos do criador logado
  getMyContents: async () => {
    const response = await axios.get(`${API_URL}/my-contents`, {
      withCredentials: true
    });
    return response.data;
  },

  // Apagar conteúdo
  deleteContent: async (id: string) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true
    });
    return response.data;
  }
};