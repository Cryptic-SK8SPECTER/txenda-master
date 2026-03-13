import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import NearbyPeopleSection from "@/components/dashboard/NearbyPeopleSection";
import AvailableNowSection from "@/components/dashboard/AvailableNowSection";
import PremiumContentSection from "@/components/dashboard/PremiumContentSection";
import ChatPage from "@/pages/ChatPage";
import SubscriptionPage from "@/pages/SubscriptionPage";
import Premium from "@/pages/Premium";
import Nearby from "@/pages/Nearby";
import Profile from "@/pages/Profile";
import Details from "@/pages/Details";
import Favorites from "@/pages/Favorites";
import { Badge } from "@/components/ui/badge";
import { Filter, ShieldCheck, MapPin, MapPinOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterDialog from "@/components/dashboard/FilterDialog";
import { useState } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import NotificationPage from "./NoficiationPage";
import { type FilterState, defaultFilters } from "@/types/filters";
import { useAuth } from "@/context/AuthContext";

const DashboardHome = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { status } = useGeolocation();
  const { user } = useAuth();


  const activeFiltersCount = Object.keys(filters).filter((key) => {
    // Lógica simples para contar quantos filtros não estão no padrão
    return (
      JSON.stringify(filters[key as keyof FilterState]) !==
      JSON.stringify(defaultFilters[key as keyof FilterState])
    );
  }).length;

  const { toast } = useToast();

  useEffect(() => {
    const search = searchParams.get("search") || "";
    if (filters.searchTerm !== search) {
      setFilters((prev) => ({ ...prev, searchTerm: search }));
    }
  }, [searchParams, filters.searchTerm]);

  useEffect(() => {
    if (searchParams.get("status") === "success") {
      toast({
        title: "Assinatura Ativada!",
        description: "Bem-vindo ao clube premium. Aproveite as suas vantagens.",
      });
    }
  }, [searchParams]);

  return (
    <>
      {/* Welcome banner */}
      <div className="px-4 lg:px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Bem-vindo de volta 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Descubra novas conexões e conteúdos exclusivos perto de si.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user?.isVerified ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                <ShieldCheck className="h-3 w-3" /> Perfil Verificado
              </Badge>
            ) : (
              <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 gap-1">
                <Shield className="h-3 w-3" /> Perfil Não Verificado
              </Badge>
            )}
            <Badge className="bg-secondary text-muted-foreground border-border">
              +18
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs border-border"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="h-3.5 w-3.5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Feed sections */}
      <div className="px-4 lg:px-6 py-6 space-y-8">
        <AvailableNowSection filters={filters} />
        {/* Geolocation-dependent section */}
        {status === "requesting" && (
          <div className="text-center py-8 glass rounded-xl animate-pulse">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              A solicitar a sua localização...
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Permita o acesso para ver pessoas próximas.
            </p>
          </div>
        )}
        {status === "granted" && <NearbyPeopleSection filters={filters} />}
        {status === "denied" && (
          <div className="text-center py-8 glass rounded-xl">
            <MapPinOff className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm font-medium">
              Localização não disponível
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Ative a localização nas configurações do navegador para ver
              pessoas próximas.
            </p>
          </div>
        )}
        <PremiumContentSection filters={filters} />

        {/* Empty state fallback */}
        <div className="text-center py-8 glass rounded-xl">
          <p className="text-muted-foreground text-sm">
            Não encontrou ninguém por perto?
          </p>
          <Button variant="link" className="text-primary mt-1">
            🌍 Explorar outras cidades →
          </Button>
        </div>
      </div>

      <FilterDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
      />
    </>
  );
};

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DashboardSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
              <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="profile" element={<Profile />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="premium" element={<Premium />} />
                <Route path="nearby" element={<Nearby />} />
                <Route path="details/:id" element={<Details />} />
                <Route path="chat/:id" element={<ChatPage />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                <Route path="notifications" element={<NotificationPage />} />
              </Routes>
            </main>
            <MobileBottomNav />
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
