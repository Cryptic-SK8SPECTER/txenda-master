import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  // Se o context ainda está a verificar o token no servidor, mostra um ecrã de espera
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Só depois de terminar o loading é que verificamos se o user existe
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


export default ProtectedRoute;
