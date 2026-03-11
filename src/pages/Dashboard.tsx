import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import NearbyPeopleSection from "@/components/dashboard/NearbyPeopleSection";
import AvailableNowSection from "@/components/dashboard/AvailableNowSection";
import PremiumContentSection from "@/components/dashboard/PremiumContentSection";
import SuggestionsSection from "@/components/dashboard/SuggestionsSection";
import Premium from "@/pages/Premium";
import Nearby from "@/pages/Nearby";
import Profile from "@/pages/Profile";
import Details from "@/pages/Details";
import Favorites from "@/pages/Favorites";
import { Badge } from "@/components/ui/badge";
import { Filter, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterDialog from "@/components/dashboard/FilterDialog";
import { useState } from "react";
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


const DashboardHome = () => {
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();
  

  const { toast } = useToast();


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
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
              <ShieldCheck className="h-3 w-3" /> Perfil Verificado
            </Badge>
            <Badge className="bg-secondary text-muted-foreground border-border">
              +18
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs border-border"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter className="h-3.5 w-3.5" /> Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Feed sections */}
      <div className="px-4 lg:px-6 py-6 space-y-8">
        <AvailableNowSection />
        <NearbyPeopleSection />
        <PremiumContentSection />
        <SuggestionsSection />

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

      <FilterDialog open={filtersOpen} onOpenChange={setFiltersOpen} />
    </>
  );
};

const Dashboard = () => {
  return (
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
            </Routes>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
