import {
  MapPin,
  Heart,
  MessageCircle,
  Eye,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { basicUrl } from "@/utils/index";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { favoriteService } from "@/services/favoriteService";
import { useToast } from "@/hooks/use-toast";
export interface Person {
  _id: string;
  name: string;
  age: number;
  distance: string;
  img: string;
  verified?: boolean;
  isOnline?: boolean;
  availableToday?: boolean;
  vip?: boolean;
  sellsContent?: boolean;
  isFavorited?: boolean;
  favoriteId?: string | null;
  profile?: {
    photo?: string;
    birthDate?: string;
  };
}

interface PersonCardProps {
  person: Person;
  onRouteSelect?: (person: Person) => void;
}

const PersonCard = ({ person, onRouteSelect }: PersonCardProps) => {
  const navigate = useNavigate();
  const { calculateAge, user: currentUser } = useAuth();
  const { toast } = useToast();

  // Estados para gerir o favorito localmente
  const [isFavorited, setIsFavorited] = useState(person.isFavorited || false);
  const [favId, setFavId] = useState(person.favoriteId || null);
  const [isPending, setIsPending] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no botão ative cliques no card

    if (!currentUser) {
      toast({
        title: "Ação necessária",
        description: "Faça login para adicionar aos favoritos.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsPending(true);
      if (isFavorited && favId) {
        // Remover
        await favoriteService.removeFavorite(favId);
        setIsFavorited(false);
        setFavId(null);
        toast({ description: "Removido dos favoritos." });
      } else {
        // Adicionar
        const res = await favoriteService.addToFavorites(person._id);

        setIsFavorited(true);
        setFavId(res.data.data._id);
        toast({ description: "Adicionado aos favoritos!" });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden glass group">
      <div className="relative h-56">
        <img
          src={`${basicUrl}img/users/${person?.profile?.photo || "default.jpg"}`}
          alt={person.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        {person.isOnline && (
          <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
        {person.verified && (
          <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-[10px] gap-1 px-1.5 py-0.5">
            <ShieldCheck className="h-3 w-3" /> Verificado
          </Badge>
        )}
        {person.vip && (
          <Badge className="absolute bottom-2 left-2 bg-gold/80 text-gold-foreground text-[10px] gap-1 px-1.5 py-0.5">
            VIP
          </Badge>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm truncate">
            {person.name.split(" ")[0]},{" "}
            {person.profile?.birthDate
              ? calculateAge(person?.profile?.birthDate)
              : ""}
          </span>
          {onRouteSelect ? (
            <button 
               className="text-[11px] text-primary hover:text-primary/80 font-medium flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full transition-colors"
               onClick={(e) => {
                 e.stopPropagation();
                 onRouteSelect(person);
               }}
            >
              <MapPin className="h-3 w-3" /> Ver Rota
            </button>
          ) : (
             <span className="text-[11px] text-muted-foreground flex items-center gap-1">
               <MapPin className="h-3 w-3" /> {person.distance}
             </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {person.availableToday && (
            <span className="text-orange-400">🔥 Disponível hoje</span>
          )}
          {person.sellsContent && (
            <span className="ml-auto">💰 Vende conteúdo</span>
          )}
        </div>

        {/* Container de Ações Ajustado */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {/* Botão de Perfil no início (esquerda) */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs hover:bg-primary/10 hover:text-primary px-3"
            onClick={() => navigate(`/dashboard/details/${person._id}`)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Perfil
          </Button>

          <div className="flex items-center gap-1.5">
            {/* BOTÃO CONFIGURADO: Heart / Favoritos */}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 hover:bg-rose-500/10"
              onClick={handleToggleFavorite}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <Heart
                  className={`h-3.5 w-3.5 transition-colors ${
                    isFavorited
                      ? "text-rose-500 fill-rose-500"
                      : "text-rose-500"
                  }`}
                />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => navigate(`/dashboard/chat/${person._id}`)}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonCard;
