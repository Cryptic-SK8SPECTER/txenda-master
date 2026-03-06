import axios from 'axios';

export const basicUrl = 'http://localhost:9000/'; 
const productionUrl = `${basicUrl}api/v1/`;

export const customFetch = axios.create({
  baseURL: productionUrl,
});

// INTERCEPTOR - Garante que o token seja lido do storage em cada request
customFetch.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});