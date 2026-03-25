import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  User,
  MapPin,
  CheckCircle,
  Crown,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface Person {
  _id: string;
  name: string;
  /** Opcional: ausente p.ex. em favoritos (sem contexto “por perto”). */
  age?: number;
  distance?: number;
  photo?: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isVip?: boolean;
  sellsContent?: boolean;
  availableToday?: boolean;
  /** GeoJSON Point do backend (nearby); usado para abrir rota no mapa. */
  location?: {
    type?: string;
    coordinates: [number, number];
  };
  profile?: {
    _id: string;
  };
  favoriteId?: string;
  isFavorited?: boolean;
}

interface PersonCardProps {
  person: Person;
  onRouteSelect?: (person: Person) => void;
  onFavoriteToggle?: (person: Person, nextValue: boolean) => void | Promise<void>;
}

const iconBtnClass =
  "flex h-8 w-8 items-center justify-center rounded-md text-white transition-colors duration-200 hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95";

/** Em md+: esconde até hover/focus-within; em ecrãs pequenos mantém visível (toque). */
const revealOverlay =
  "opacity-100 translate-y-0 transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 " +
  "md:opacity-0 md:translate-y-2 md:group-hover/person:opacity-100 md:group-hover/person:translate-y-0 " +
  "md:group-focus-within/person:opacity-100 md:group-focus-within/person:translate-y-0";

export function PersonCard({
  person,
  onRouteSelect,
  onFavoriteToggle,
}: PersonCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(Boolean(person.isFavorited));
  const [imageError, setImageError] = useState(false);

  /** Rotas e API usam sempre o ID do User, não o ID do documento Profile. */
  const userId = person._id;
  const canOpen = !!userId;

  const handleProfileClick = () => {
    if (!userId) {
      toast.error("Não foi possível abrir este perfil.");
      return;
    }
    navigate(`/details/${userId}`);
  };

  const handleMessageClick = () => {
    if (!userId) {
      toast.error("Não foi possível abrir a conversa.");
      return;
    }
    navigate(`/dashboard/messages/${userId}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextValue = !isFavorite;
    setIsFavorite(nextValue);
    onFavoriteToggle?.(person, nextValue);
    if (!onFavoriteToggle) {
      toast.success(
        nextValue ? "Adicionado aos favoritos" : "Removido dos favoritos",
      );
    }
  };

  const handleRouteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRouteSelect) {
      onRouteSelect(person);
      return;
    }
    const coords = person.location?.coordinates;
    if (coords && coords.length >= 2) {
      navigate("/dashboard/nearby", {
        state: { openRouteForPerson: person },
      });
      return;
    }
    toast.info("Abre Por perto no mapa para planear rotas.");
    navigate("/dashboard/nearby");
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const showPlaceholder = !person.photo || imageError;

  const displayAge =
    typeof person.age === "number" && Number.isFinite(person.age)
      ? person.age
      : null;
  const displayDistanceKm =
    typeof person.distance === "number" && Number.isFinite(person.distance)
      ? person.distance
      : null;

  return (
    <article
      className={cn(
        "group group/person relative w-full overflow-hidden rounded-xl border border-white/15 bg-muted/20",
        "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-300",
        "hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.45)]",
        "aspect-[3/4] w-full min-h-[220px]",
        canOpen && "cursor-pointer",
      )}
      onClick={canOpen ? handleProfileClick : undefined}
      onKeyDown={
        canOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleProfileClick();
              }
            }
          : undefined
      }
      role={canOpen ? "button" : undefined}
      tabIndex={canOpen ? 0 : undefined}
      aria-label={canOpen ? `Ver perfil de ${person.name}` : undefined}
    >
      <div className="absolute inset-0">
        {showPlaceholder ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/60 text-muted-foreground">
            <ImageIcon className="h-12 w-12 opacity-40" />
            <span className="text-xs font-medium">Sem foto</span>
          </div>
        ) : (
          <img
            src={person.photo}
            alt={person.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Legibilidade: reforça no hover quando o overlay de texto aparece */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/60 transition-[opacity,background-image] duration-300 ease-out group-hover/person:from-black/45 group-hover/person:to-black/78"
        aria-hidden
      />

      {/* Nome + meta — canto inferior esquerdo */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-3 left-3 right-11 z-10 sm:bottom-4 sm:left-4 sm:right-12",
          revealOverlay,
        )}
      >
        <h2 className="line-clamp-2 font-sans text-base font-bold leading-snug tracking-tight text-white drop-shadow-sm sm:text-[1.05rem]">
          {person.name}
        </h2>
        {(displayAge != null || displayDistanceKm != null) && (
          <p className="mt-0.5 font-sans text-xs font-medium text-white/85 whitespace-normal sm:whitespace-nowrap">
            {displayAge != null && <span>{displayAge} anos</span>}
            {displayAge != null && displayDistanceKm != null && (
              <span className="mx-1 text-white/40">·</span>
            )}
            {displayDistanceKm != null && (
              <span>{displayDistanceKm.toFixed(1)} km</span>
            )}
          </p>
        )}
        {(person.isVerified || person.isVip) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-white/90">
            {person.isVerified && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
                <CheckCircle className="h-3 w-3 shrink-0 text-white" />
                Verificado
              </span>
            )}
            {person.isVip && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200/95">
                <Crown className="h-3 w-3 shrink-0" />
                VIP
              </span>
            )}
          </div>
        )}
        {(person.sellsContent || person.availableToday) && (
          <p className="mt-1 max-w-full font-sans text-[11px] leading-snug text-white/72">
            {[
              person.availableToday && "Disponível hoje",
              person.sellsContent && "Vende conteúdo",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      {/* Online — canto superior direito */}
      {person.isOnline && (
        <div
          className={cn(
            "pointer-events-none absolute right-3 top-3 z-10 sm:right-4 sm:top-4",
            revealOverlay,
          )}
          aria-hidden
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-white bg-emerald-500 shadow-sm" />
          </span>
        </div>
      )}

      {/* Ações — coluna vertical canto inferior direito */}
      <div
        className={cn(
          "absolute bottom-3 right-3 z-20 flex flex-col gap-0.5 sm:bottom-4 sm:right-4",
          revealOverlay,
          "md:pointer-events-none md:group-hover/person:pointer-events-auto md:group-focus-within/person:pointer-events-auto",
        )}
        onClick={stop}
        role="group"
        aria-label="Ações"
      >
        <button
          type="button"
          className={iconBtnClass}
          onClick={(e) => {
            stop(e);
            handleProfileClick();
          }}
          aria-label="Ver perfil"
        >
          <User className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          className={iconBtnClass}
          onClick={(e) => {
            stop(e);
            handleMessageClick();
          }}
          aria-label="Enviar mensagem"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          className={iconBtnClass}
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? "Remover favorito" : "Adicionar favorito"}
        >
          <Heart
            className={cn("h-4 w-4", isFavorite && "fill-white text-white")}
            strokeWidth={2}
          />
        </button>
        <button
          type="button"
          className={iconBtnClass}
          onClick={handleRouteClick}
          aria-label="Ver rota no mapa"
        >
          <MapPin className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </article>
  );
}

export default PersonCard;
