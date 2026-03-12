import { useState, useEffect } from "react";
import { Star, MapPin, Loader2, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PersonCard from "@/components/nearby/PersonCard";
import { favoriteService } from "@/services/favoriteService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Favorites = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Função para carregar os dados do servidor
  const fetchFavorites = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const res = await favoriteService.loadFavorites();

      // DEBUG: Monitorização dos dados brutos recebidos do backend
      console.log("DADOS RECEBIDOS DO SERVER:", res.data);

      const favoritesData = res.data?.data || [];

      // Formatação e proteção dos dados para o PersonCard
      const formattedPeople = favoritesData
        .filter((fav: any) => fav.targetId) // Garante que o objeto referenciado existe
        .map((fav: any) => {
          // Verifica se o alvo é um Utilizador ou Conteúdo para definir o nome corretamente
          const isUser = fav.targetType === "User" || fav.targetType === "user";

          return {
            ...fav.targetId,
            _id: fav.targetId._id,
            // Proteção contra valores nulos que causam a "tela preta"
            name: isUser
              ? fav.targetId.name
              : fav.targetId.description || "Conteúdo Premium",
            favoriteId: fav._id,
            isFavorited: true,
          };
        });

      setItems(formattedPeople);
    } catch (err: any) {
      // Depuração de erros de rede ou servidor
      console.error("ERRO DETALHADO AXIOS:", err.response?.data || err.message);

      toast({
        variant: "destructive",
        title: "Erro de Sincronização",
        description: "Não foi possível carregar a sua lista de favoritos.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger automático ao montar o componente ou mudar de utilizador
  useEffect(() => {
    fetchFavorites();
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            A carregar os teus favoritos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header Fixo */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          <h1 className="font-display text-xl font-bold">Favoritos</h1>
        </div>

        <div className="ml-auto">
          <Badge variant="secondary" className="font-mono">
            {items.length} {items.length === 1 ? "Perfil" : "Perfis"}
          </Badge>
        </div>
      </header>

      {/* Área de Conteúdo */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass rounded-2xl border-dashed border-2 border-border/50">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
              <HeartOff className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold">A tua lista está vazia</h3>
            <p className="text-muted-foreground text-sm max-w-[250px] mt-1">
              Adiciona perfis aos favoritos para os encontrares rapidamente
              aqui.
            </p>
            <Button
              variant="default"
              className="mt-6 rounded-full px-8"
              onClick={() => window.history.back()}
            >
              Explorar Pessoas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {items.map((person) => (
              <PersonCard
                key={person._id || person.favoriteId}
                person={person}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;
