import axios from 'axios';

const API_URL = 'http://localhost:9000/api/v1/plans';

export const planService = {
  // Lista todos os planos disponíveis
  getAllPlans: async () => {
    const response = await axios.get(API_URL, {
      withCredentials: true
    });
    return response.data;
  }
};