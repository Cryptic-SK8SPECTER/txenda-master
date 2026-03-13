import axios from 'axios';

const API_URL = 'http://localhost:9000/api/v1/analytics';

export const analyticsService = {
  getCreatorStats: async () => {
    const response = await axios.get(`${API_URL}/creator-stats`, {
      withCredentials: true
    });
    return response.data;
  }
};
