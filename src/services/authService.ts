import axios from 'axios';

const API_URL = 'http://localhost:9000/api/v1/users'; // Ajuste a porta se necessário

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  }, {
    withCredentials: true // Importante para enviar/receber cookies/JWT
  });

  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  
  return response.data;
};

// Envia o e-mail de recuperação
export const forgotPassword = async (email: string) => {
    const response = await axios.post(`${API_URL}/forgotPassword`, { email });
    return response.data;
  };
  
  // Define a nova password usando o token vindo da URL
  export const resetPassword = async (token: string, password: string, passwordConfirm: string) => {
    const response = await axios.patch(`${API_URL}/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  };

  export const registerUser = async (formData: FormData) => {
    const response = await axios.post(`${API_URL}/signup`, formData, {
      withCredentials: true,
    });
    return response.data;
  };
  
  export const logoutUser = async () => {
    try {
      // 1. Chama a API para limpar o cookie (importante se usar httpOnly)
      await axios.get(`${API_URL}/logout`, { withCredentials: true });
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao fazer logout", error);
      // Mesmo com erro na API, limpamos o local por segurança
      localStorage.removeItem('token');
    }
  };