import { useState, useEffect } from "react";
import { Diamond, Lock, Play, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { contentService } from "@/services/contentService";
import { ITEMS_PER_PAGE } from "@/utils/index";
import { useToast } from "@/hooks/use-toast";
import SkeletonGrid from "../content/SkeletonGrid";
import ContentCard from "../content/ContentCard";
import Pagination from "../content/Pagination";
import { motion, AnimatePresence } from "framer-motion";


const PremiumContentSection = () => {
  const [allContents, setAllContents] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { toast } = useToast();

  const navigate = useNavigate();

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true); // Ativa o skeleton
      try {
        const res = await contentService.getAllContents(currentPage, ITEMS_PER_PAGE);

        // LOG DE DEBUG - Verifique o que aparece no console agora

        const contentArray = res.data?.data;
        const total = res.total;

        setAllContents(contentArray);
        setTotalItems(total);

      } catch (err) {
        console.error("Erro no fetch:", err);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os conteúdos.",
          variant: "destructive"
        });
      } finally {
        // ESTA LINHA É OBRIGATÓRIA PARA O SKELETON SUMIR
        setLoading(false);
      }
    };

    fetchFeed();
  }, [currentPage]);

  const handlePageChange = (page: number) => {

    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Diamond className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">
            Conteúdo Premium
          </h2>
        </div>
        <Button
          variant="link"
          className="text-primary text-sm"
          onClick={() => navigate("/dashboard/premium")}
        >
          Explorar →
        </Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`page-${currentPage}`}
          // ... animações
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {loading ? (
            <SkeletonGrid count={8} />
          ) : (
            // MAPEIE allContents diretamente
            allContents.map((content, i) => (
              <ContentCard
                key={content._id}
                content={content}
                index={i}
                isLocked={false}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </section>
  );
};

export default PremiumContentSection;
