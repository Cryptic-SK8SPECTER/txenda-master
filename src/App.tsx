import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SubscriptionPage from "./pages/SubscriptionPage";
import Register from "./pages/RegisterCreator";
import Signup from "./pages/Signup";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import RecoverPassword from "./pages/RecoverPassword";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "./pages/NotFound";
import SuccessPage from "./pages/SuccessPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CancelSubscriptionPage from "./pages/CancelSubscriptionPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/recover" element={<RecoverPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              }
            />

            {/* Rotas de Retorno do Stripe */}
            <Route
              path="/payment-success"
              element={
                <ProtectedRoute>
                  <SuccessPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/subscription/cancel"
              element={
                <ProtectedRoute>
                  <CancelSubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
