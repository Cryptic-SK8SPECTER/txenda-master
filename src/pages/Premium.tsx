import { useState } from "react";
import { Diamond, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import PremiumContentSection from "@/components/dashboard/PremiumContentSection";
import FilterDialog from "@/components/dashboard/FilterDialog";
import { type FilterState, defaultFilters } from "@/types/filters";
import { useAuth } from "@/context/AuthContext";

const Premium = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { planTier, subscription } = useAuth();

  const hasPremiumAccess =
    subscription &&
    subscription.status === "active" &&
    new Date(subscription.endDate) > new Date();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 backdrop-blur-md px-4 py-2">
        <Diamond className="h-5 w-5 text-primary" />
        <h1 className="font-display text-xl font-semibold">Conteúdo Premium</h1>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-4 w-4 mr-1" /> Filtros
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!hasPremiumAccess ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-4">
              Acesso completo ao conteúdo está disponível apenas para
              subscritores com plano ativo.
            </p>
            <Button asChild>
              <a href="/dashboard/subscription">Atualizar plano</a>
            </Button>
          </div>
        ) : (
          <PremiumContentSection filters={filters} />
        )}
      </div>

      <FilterDialog 
        open={filtersOpen} 
        onOpenChange={setFiltersOpen} 
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
      />
    </div>
  );
};

export default Premium;
