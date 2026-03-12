import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Enquanto o AuthContext verifica a sessão (ex: validando token no refresh)
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  // 2. Se a verificação terminou e não existe usuário logado
  if (!user) {
    // Redireciona para o login, mas guarda a página que o usuário tentou acessar
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Se estiver logado, renderiza os componentes filhos (o Dashboard)
  return <>{children}</>;
};

export default ProtectedRoute;
