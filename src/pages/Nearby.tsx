import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Bell,
  Filter,
  List as ListIcon,
  Map as MapIcon,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import FilterDialog from "@/components/dashboard/FilterDialog";
import PersonCard from "@/components/nearby/PersonCard";
import MapView from "@/components/nearby/MapView";

// Hooks e Serviços Reais
import { locationService } from "@/services/locationService";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { type FilterState, defaultFilters } from "@/types/filters";
import { basicUrl } from "@/utils/index";

const Nearby = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();

  // --- Estados de UI ---
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortOption, setSortOption] = useState("mais_proximos");
  const [plan] = useState<"standard" | "premium" | "vip">("standard");
  const [selectedUserForRoute, setSelectedUserForRoute] = useState<any | null>(null);

  // --- Estados de Dados ---
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // --- Hooks ---
  const { location, status } = useGeolocation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Quando os filtros mudam, reinicia paginação
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Abrir mapa + rota vindo do dashboard (PersonCard sem onRouteSelect)
  useEffect(() => {
    const st = routerLocation.state as {
      openRouteForPerson?: { location?: { coordinates?: number[] } };
    } | null;
    const p = st?.openRouteForPerson;
    const coords = p?.location?.coordinates;
    if (p && Array.isArray(coords) && coords.length >= 2) {
      setSelectedUserForRoute(p);
      setViewMode("map");
      navigate(routerLocation.pathname, { replace: true, state: {} });
    }
  }, [routerLocation.state, routerLocation.pathname, navigate]);

  // --- Efeito de Busca de Dados ---
  useEffect(() => {
    const fetchNearby = async () => {
      // Só busca se tiver permissão de GPS e as coordenadas
      if (status === "granted" && location) {
        setLoading(true);
        try {
          const res = await locationService.getNearbyUsers(
            filters.distance, // Raio baseado nos filtros
            location.lat,
            location.lng,
            10, // Limite de 10 por página
            page,
          );

          const rawData = res.data?.data || [];

          // 1. Filtro de Segurança: Remove o próprio usuário da lista
          const currentUserId = String(currentUser?._id);
          const filteredData = rawData.filter(
            (loc: any) => String(loc.user?._id) !== currentUserId,
          );

          // 2. Formatação para o PersonCard
          const formattedUsers = filteredData
            .map((loc: any) => {
              const u = loc.user;
              if (!u?._id) return null;
              const profile = u.profile || {};
              const age = profile.birthDate
                ? Math.floor(
                    (Date.now() - new Date(profile.birthDate).getTime()) /
                      (365.25 * 24 * 60 * 60 * 1000),
                  )
                : 0;
              const dist =
                typeof loc.distance === "number" && Number.isFinite(loc.distance)
                  ? loc.distance
                  : 0;
              return {
                ...u,
                _id: u._id,
                location: loc.location,
                distance: dist,
                age,
                photo: profile.photo
                  ? `${basicUrl}img/users/${profile.photo}`
                  : undefined,
                isOnline: u.isOnline || false,
              };
            })
            .filter(
              (user): user is NonNullable<typeof user> => user != null,
            );

          // 3. Lógica de Paginação
          // Se for página 1, substitui. Se for > 1, adiciona ao final (Load More).
          setUsers((prev) => {
            const newUsers =
              page === 1 ? formattedUsers : [...prev, ...formattedUsers];

            const uniqueUsers = Array.from(
              new Map(newUsers.map((u) => [u._id, u])).values(),
            );

            return uniqueUsers;
          });

          // 4. Verifica se há mais para carregar (se veio menos que o limite, acabou)
          setHasMore(rawData.length === 10);
        } catch (err) {
          console.error("Erro ao carregar pessoas próximas:", err);
          toast({
            title: "Erro",
            description: "Não foi possível carregar as pessoas próximas.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else if (status === "denied") {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [location, status, page, currentUser?._id, filters.distance, toast]);

  const distanceKm = (d: unknown) => {
    if (typeof d === "number" && Number.isFinite(d)) return d;
    if (typeof d === "string") {
      const match = d.match(/[\d.]+/);
      return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
    }
    return Number.POSITIVE_INFINITY;
  };

  const filteredUsers = users.filter((u: any) => {
    const profile = u.profile || {};

    // Quick filters
    if (filters.quickFilters.includes("Disponíveis Agora") && !u.isOnline) {
      return false;
    }
    if (filters.quickFilters.includes("Verificados") && !u.isVerified) {
      return false;
    }
    if (filters.quickFilters.includes("Perto de Mim") && distanceKm(u.distance) > 10) {
      return false;
    }

    // Género
    if (
      filters.gender !== "all" &&
      profile.gender?.toLowerCase() !== filters.gender.toLowerCase()
    ) {
      return false;
    }

    // Idade
    const age = profile.birthDate
      ? Math.floor(
          (Date.now() - new Date(profile.birthDate).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000),
        )
      : null;
    if (age == null || age < filters.ageRange[0] || age > filters.ageRange[1]) {
      return false;
    }

    // Estado
    if (filters.status === "online" && !u.isOnline) return false;
    if (filters.status === "today" && !u.isOnline) return false;
    if (filters.status === "weekend" && !u.isOnline) return false;

    // Localização textual
    if (
      filters.city &&
      !profile.location?.toLowerCase().includes(filters.city.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.country &&
      !profile.location?.toLowerCase().includes(filters.country.toLowerCase())
    ) {
      return false;
    }

    // Pesquisa
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const match =
        u.name?.toLowerCase().includes(term) ||
        profile.location?.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term);
      if (!match) return false;
    }

    // Tipo de perfil
    if (
      filters.profileTypes.includes("Apenas verificados") &&
      !u.isVerified
    ) {
      return false;
    }
    if (filters.profileTypes.includes("Perfis premium") && !u.vip) {
      return false;
    }
    if (filters.profileTypes.includes("Conteúdo à venda") && !u.sellsContent) {
      return false;
    }

    // Intenções
    if (filters.intentions.length > 0 && !filters.intentions.includes("Ambos")) {
      const lookingFor = (profile.lookingFor || "").toLowerCase();
      const matchesIntent = filters.intentions.some((intent) => {
        const i = intent.toLowerCase();
        if (i.includes("conteúdo")) return lookingFor.includes("conteudos");
        if (i.includes("encontro")) return lookingFor.includes("encontros");
        return lookingFor.includes("ambos");
      });
      if (!matchesIntent) return false;
    }

    return true;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortOption === "online_agora") {
      return Number(Boolean(b.isOnline)) - Number(Boolean(a.isOnline));
    }
    if (sortOption === "novos_perfis") {
      const ad = a.profile?.createdAt ? new Date(a.profile.createdAt).getTime() : 0;
      const bd = b.profile?.createdAt ? new Date(b.profile.createdAt).getTime() : 0;
      return bd - ad;
    }
    return distanceKm(a.distance) - distanceKm(b.distance); // mais_proximos
  });

  // Contadores visuais (Baseados no que foi carregado)
  const onlineCount = sortedUsers.filter((u) => u.isOnline).length;
  

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pb-20">
      {/* Header Fixo */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 backdrop-blur-md px-4 py-2">
        <div className="flex items-center gap-1">
          <MapPin className="h-5 w-5 text-primary" />
          {/* <span className="text-sm font-medium">Lisboa, Portugal</span> */}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-4 w-4 mr-1" /> Filtrar
          </Button>
        </div>
      </header>

      {/* Indicadores Psicológicos */}
      <div className="px-4 py-2 text-[11px] text-muted-foreground bg-muted/20">
        {onlineCount > 0
          ? `${onlineCount} pessoas online agora perto de você`
          : "Buscando pessoas ativas..."}
      </div>

      {/* Controles de Visão e Ordenação */}
      <div className="flex items-center px-4 py-2 gap-2 border-b border-border/50">
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => {
              setViewMode("list");
              setSelectedUserForRoute(null);
            }}
            className="h-8 text-xs"
          >
            <ListIcon className="h-3.5 w-3.5 mr-1" /> Lista
          </Button>
          <Button
            variant={viewMode === "map" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="h-8 text-xs"
          >
            <MapIcon className="h-3.5 w-3.5 mr-1" /> Mapa
          </Button>
        </div>

        <div className="ml-auto w-36">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="h-8 text-[11px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mais_proximos">Mais próximos</SelectItem>
              <SelectItem value="online_agora">Online agora</SelectItem>
              <SelectItem value="novos_perfis">Novos perfis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col">
        {status === "prompt" || (loading && page === 1) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Localizando pessoas...
            </p>
          </div>
        ) : viewMode === "map" ? (
          <div className="flex-1 relative">
            <MapView
              users={users}
              currentLocation={location}
              selectedUserForRoute={selectedUserForRoute}
              loggedInUser={currentUser}
            />
          </div>
        ) : (
          // Visão de Lista
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {plan === "standard" && (
              <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  No plano <strong>Standard</strong>, mostramos resultados
                  limitados.
                </p>
                <Button
                  variant="link"
                  className="text-primary text-[11px] h-auto p-0"
                >
                  Upgrade
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedUsers.map((user, index) => (
                <PersonCard
                  key={user._id || index}
                  person={user}
                  onRouteSelect={(user) => {
                    setSelectedUserForRoute(user);
                    setViewMode("map");
                  }}
                />
              ))}
            </div>

            {/* Paginação Estilo Load More */}
            {sortedUsers.length > 0 && (
              <div className="mt-8 flex justify-center">
                {hasMore ? (
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading}
                    className="min-w-[200px]"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      "Carregar mais pessoas"
                    )}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Você chegou ao fim da lista nesta região.
                  </p>
                )}
              </div>
            )}

            {sortedUsers.length === 0 && !loading && (
              <div className="text-center py-20">
                <MapPin className="h-10 w-10 text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Não encontramos ninguém para estes filtros.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <FilterDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  );
};

export default Nearby;
