import React, { createContext, useContext, useState, useEffect } from 'react';
import { logoutUser } from '@/services/authService';
import { customFetch } from "@/utils/index";

interface AuthContextType {
  user: any;
  profile: any;
  subscription: any;
  isLoading: boolean;
  signin: (userData: any, token: any) => void;
  logout: () => void;
  // --- ADICIONA ESTAS DUAS LINHAS ---
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
    if (!userId || userId === 'undefined') return;
  
    // Criamos um array de promessas para correr em paralelo
    const profilePromise = customFetch.get(`profiles/${userId}`);
    const subPromise = customFetch.get(`subscriptions/${userId}`);
  
    // Tratamos o Perfil: se falhar (ex: 404), o utilizador é apenas um "User comum"
    const profileResult = await profilePromise
      .then(res => res.data.data.profile || res.data.data)
      .catch(() => null); // Retorna null se não houver perfil
  
    // Tratamos a Subscrição
    const subResult = await subPromise
      .then(res => res.data.data)
      .catch(() => null);
  
    setProfile(profileResult);
    setSubscription(subResult);
  };
  
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // IMPORTANTE: Esperar que os dados do perfil cheguem antes de parar o loading
          const userId = parsedUser._id || parsedUser.id;
          await loadExtraData(userId);
        } catch (err) {
          console.error("Erro na recuperação do utilizador:", err);
          logout(); // Se os dados estiverem corrompidos, limpa tudo
        }
      }

      // Só aqui o isLoading passa a false
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signin = async (userData: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    setUser(userData);

    const userId = userData._id || userData.id;
    await loadExtraData(userId);
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setSubscription(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    // --- ADICIONA setUser E setProfile AQUI NO PROVIDER ---
    <AuthContext.Provider value={{
      user,
      profile,
      subscription,
      isLoading,
      signin,
      logout,
      setUser,
      setProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};