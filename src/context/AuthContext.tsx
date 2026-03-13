import React, { createContext, useContext, useState, useEffect } from "react";
import { initializeSocket, disconnectSocket } from "@/services/authService";
import { customFetch } from "@/utils/index";

type PlanTier = "free" | "standard" | "premium" | "vip";

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
  planTier: PlanTier;
  hasPlan: (required: PlanTier) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar dados complementares (Perfil e Assinatura)
  const loadExtraData = async (userId: string) => {
    if (!userId || userId === "undefined") return;

    try {
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

  // AuthContext.tsx

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      // 1. RESTAURAÇÃO IMEDIATA E LIMPEZA DE LIXO
      if (savedToken && savedUser) {
        try {
          // Se o que estiver guardado for lixo, removemos
          if (savedUser === "undefined" || savedUser === "[object Object]") {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
          } else {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            initializeSocket(parsedUser._id || parsedUser.id);
            // Carregamos logo os dados extras para não "perder a secção"
            loadExtraData(parsedUser._id || parsedUser.id);
          }
        } catch (e) {
          console.error("❌ Dados locais corrompidos. Limpando...");
          localStorage.removeItem("user");
        }
      }

      // 2. VALIDAÇÃO SILENCIOSA
      if (savedToken) {
        try {
          const response = await customFetch.get("users/me");

          const freshUser = response.data?.data?.data;
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } catch (err: any) {
          const status = err.response?.status;
          console.warn("Status da validação:", status);

          // SÓ faz logout se o erro for de autenticação (401/403)
          if (status === 401 || status === 403) {
            logout();
          } else {
            // Erro de rede/CORS: mantemos o que restaurámos no Step 1
            console.log("⚠️ Servidor inacessível, mantendo sessão local.");
          }
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signin = async (userData: any, token: string) => {
    if (!userData || !token) return;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    const userId = userData._id || userData.id;

    if (userId) {
      initializeSocket(userId);
      await loadExtraData(userId);
    }
  };

  const logout = () => {
    disconnectSocket();
    setUser(null);
    setProfile(null);
    setSubscription(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Usamos o location para garantir limpeza total do estado da app
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

  const resolvePlanTier = (): PlanTier => {
    if (!subscription || subscription.status !== "active") return "free";
    const name = (subscription.plan?.name || "").toLowerCase();
    if (name.includes("vip")) return "vip";
    if (name.includes("premium")) return "premium";
    return "standard";
  };

  const currentPlanTier: PlanTier = resolvePlanTier();

  const hasPlan = (required: PlanTier) => {
    const order: Record<PlanTier, number> = {
      free: 0,
      standard: 1,
      premium: 2,
      vip: 3,
    };
    return order[currentPlanTier] >= order[required];
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
        planTier: currentPlanTier,
        hasPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
