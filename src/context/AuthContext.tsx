import React, { createContext, useContext, useState, useEffect } from "react";
import {
  logoutUser,
  initializeSocket,
  disconnectSocket,
} from "@/services/authService";
import { customFetch } from "@/utils/index";

interface AuthContextType {
  user: any;
  profile: any;
  subscription: any;
  isLoading: boolean;
  signin: (userData: any, token: any) => void;
  logout: () => void;
  calculateAge: (dob: string) => number | null;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadExtraData = async (userId: string) => {
    if (!userId || userId === "undefined") return;

    try {
      // Correr em paralelo para performance
      const [profileRes, subRes] = await Promise.allSettled([
        customFetch.get(`profiles/${userId}`),
        customFetch.get(`subscriptions/${userId}`),
      ]);

      const profileData =
        profileRes.status === "fulfilled"
          ? profileRes.value.data.data.profile || profileRes.value.data.data
          : null;

      const subData =
        subRes.status === "fulfilled" ? subRes.value.data.data : null;

      setProfile(profileData);
      setSubscription(subData);
    } catch (err) {
      console.error("Erro ao carregar dados extras:", err);
    }
  };

  // Efeito para inicializar a aplicação (F5 ou abertura de aba)
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          const userId = parsedUser._id || parsedUser.id;

          // 1. ATIVA WEBSOCKET NA RESTAURAÇÃO DE SESSÃO
          initializeSocket(userId);

          // 2. Carrega dados complementares
          await loadExtraData(userId);
        } catch (err) {
          console.error("Erro na recuperação do utilizador:", err);
          logout();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signin = async (userData: any, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    const userId = userData._id || userData.id;

    // ATIVA WEBSOCKET NO LOGIN
    initializeSocket(userId);

    await loadExtraData(userId);
  };

  const logout = () => {
    // DESCONECTA WEBSOCKET NO LOGOUT
    disconnectSocket();

    setUser(null);
    setProfile(null);
    setSubscription(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return null;
    return Math.floor(
      (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        subscription,
        isLoading,
        signin,
        logout,
        setUser,
        setProfile,
        calculateAge,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
