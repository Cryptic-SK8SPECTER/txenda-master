import { useState, useEffect } from "react";
import { Diamond } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { contentService } from "@/services/contentService";
import { ITEMS_PER_PAGE } from "@/utils/index";
import { useToast } from "@/hooks/use-toast";
import SkeletonGrid from "../content/SkeletonGrid";
import ContentCard from "../content/ContentCard";
import Pagination from "../content/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { type FilterState } from "@/types/filters";

// 1. Adicionamos a interface para receber os filtros do Dashboard
interface PremiumContentSectionProps {
  filters: FilterState;
}

const PremiumContentSection = ({ filters }: PremiumContentSectionProps) => {
  const [allContents, setAllContents] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();
  const navigate = useNavigate();

  // 2. Resetar para a página 1 sempre que os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const res = await contentService.getAllContents(
          currentPage,
          ITEMS_PER_PAGE,
          filters
        );

        const rawData = res.data?.data || [];
        const total = res.total || 0;
        
        setAllContents(rawData);
        setTotalItems(total);
      } catch (err: any) {
        const isNetworkError = err?.message === "Network Error" || err?.code === "ERR_NETWORK";
        const description = isNetworkError
          ? "A API não respondeu (CORS ou servidor). No Render defina FRONTEND_URL com o URL exato deste site; na Vercel defina VITE_API_URL com o URL da API."
          : err?.response?.data?.message || "Não foi possível carregar os conteúdos.";
        console.error("Erro no fetch:", err);
        toast({
          title: "Erro ao carregar",
          description,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [currentPage, filters, toast]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll suave para o topo da seção ao mudar de página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Diamond className="h-5 w-5 text-primary fill-primary/20" />
            <h2 className="font-display text-xl font-semibold">
              Conteúdo Premium
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Acesso exclusivo aos criadores mais populares
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-xs border-primary/20 hover:bg-primary/10 text-primary"
          onClick={() => navigate("/dashboard/premium")}
        >
          Ver Catálogo Completo
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`content-grid-${currentPage}-${JSON.stringify(filters)}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
        >
          {loading ? (
            <SkeletonGrid count={8} />
          ) : allContents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allContents.map((content, i) => (
                <ContentCard
                  key={content._id}
                  content={content}
                  index={i}
                  route={"/dashboard/subscription"}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 rounded-2xl border-2 border-dashed border-border">
              <Diamond className="h-10 w-10 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm font-medium">
                Nenhum conteúdo premium encontrado para estes filtros.
              </p>
              <Button
                variant="link"
                onClick={() => navigate(0)} // Recarrega a página ou limpa filtros
                className="text-primary text-xs mt-2"
              >
                Limpar todos os filtros
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination - Só mostra se houver mais de uma página */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-border/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </section>
  );
};

export default PremiumContentSection;
