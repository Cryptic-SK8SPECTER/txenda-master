import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import ProfileView from "./pages/ProfileView";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SubscriptionPage from "./pages/SubscriptionPage";
import Chat from "./pages/Chat";
import RecoverPassword from "./pages/RecoverPassword";
import { AuthProvider } from "./context/AuthContext";
import NotFound from "./pages/NotFound";
import CreatorDashboard from "./pages/CreatorDashboard";

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
            <Route path="/dashboard/profile-view" element={<ProfileView />} />
            <Route
              path="/dashboard/subscription"
              element={<SubscriptionPage />}
            />
            <Route path="/dashboard/messages" element={<Chat />} />
            <Route path="/recover" element={<RecoverPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
