import { io, Socket } from "socket.io-client";
import { basicUrl, customFetch } from "@/utils/index";

let socket: Socket | null = null;

export const login = async (email: string, password: string) => {
  const response = await customFetch.post(
    `users/login`,
    { email, password },
    { withCredentials: true },
  );

  // Verifique se o login foi bem sucedido e temos o token
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);

    // CORREÇÃO AQUI: Acesse o user de dentro de response.data.data
    const user = response.data.data.user;
    if (user && user._id) {
      initializeSocket(user._id);
    }
  }

  return response.data;
};

// Função para conectar e identificar o usuário no Socket
export const initializeSocket = (userId: string) => {
  if (socket) socket.disconnect();

  socket = io(basicUrl, {
    auth: { token: localStorage.getItem("token") },
    transports: ["websocket"],
  });

  // Notifica o servidor que este usuário específico está online
  socket.emit("setup", userId);

  socket.on("connected", () => {
    console.log("🔌 Conectado ao WebSocket e marcado como Online");
  });
};

// Envia o e-mail de recuperação
export const forgotPassword = async (email: string) => {
  const response = await customFetch.post(`users/forgotPassword`, {
    email,
  });
  return response.data;
};

// Define a nova password usando o token vindo da URL
export const resetPassword = async (
  token: string,
  password: string,
  passwordConfirm: string,
) => {
  const response = await customFetch.patch(`users/resetPassword/${token}`, {
    password,
    passwordConfirm,
  });
  return response.data;
};

export const registerUser = async (formData: FormData) => {
  const response = await customFetch.post(`users/signup`, formData, {
    withCredentials: true,
  });
  return response.data;
};

export const logoutUser = async () => {
  try {
    await customFetch.get(`users/logout`, { withCredentials: true });

    // DESCONECTA O SOCKET NO LOGOUT
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    localStorage.removeItem("token");
    return { success: true };
  } catch (error) {
    console.error("Erro ao fazer logout", error);
    localStorage.removeItem("token");
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket desconectado");
  }
};

// No seu authService.ts adicione:
export const getSocket = () => socket;
