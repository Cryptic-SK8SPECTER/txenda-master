import { MapPin, Heart, MessageCircle, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { locationService } from "@/services/locationService";
import { useToast } from "@/hooks/use-toast";
import { basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/hooks/use-geolocation";

export const NearbyPeopleSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // Para saber se ainda há gente para carregar
  const { calculateAge, user: currentUser } = useAuth();
  const { toast } = useToast();

  const { location, status } = useGeolocation();

  // --- NOVO: EFEITO PARA ATUALIZAR A MINHA LOCALIZAÇÃO NO DB ---
  useEffect(() => {
    const updatePresence = async () => {
      if (status === "granted" && location) {
        try {
          // Avisa o servidor onde eu estou e que estou online
          await locationService.updateMyLocation(
            location.lng, // Longitude primeiro para o MongoDB
            location.lat,
            true,
          );
          console.log("Minha localização foi atualizada no servidor.");
        } catch (err) {
          console.error("Erro ao atualizar presença geográfica:", err);
        }
      }
    };

    updatePresence();
  }, [location, status]); // Sempre que o GPS mudar, ele atualiza no banco
  // -------------------------------------------------------------

  useEffect(() => {
    const fetchNearby = async () => {
      // Verificamos se temos a localização e se é o primeiro carregamento ou reset
      if (status === "granted" && location) {
        setLoading(true);
        try {
          // 1. Chamada ao serviço com limite (ex: 10) e página atual
          // Passamos 'page' para o backend saber quantos registros 'pular' ($skip)
          const res = await locationService.getNearbyUsers(
            50, // distância em km
            location.lat,
            location.lng,
            5, // limite de resultados por página
            page, // página atual controlada pelo estado
          );

          const rawData = res.data?.data || [];

          // 2. Filtramos para não mostrar o usuário logado
          const filteredData = rawData.filter(
            (loc: any) => loc.user?._id !== currentUser?._id,
          );

          // 3. Formatamos os dados incluindo o cálculo da distância vindo do $geoNear
          const formattedUsers = filteredData.map((loc: any) => ({
            ...loc.user,
            distance: loc.distance
              ? `${loc.distance.toFixed(1)} km`
              : "Perto de você",
          }));

          // 4. Se for página 1, substituímos. Se for página > 1, concatenamos (Load More)
          setUsers((prev) =>
            page === 1 ? formattedUsers : [...prev, ...formattedUsers],
          );

          // 5. Verificamos se ainda há mais dados para carregar
          if (rawData.length < 10) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } catch (err) {
          console.error("Erro ao buscar próximos:", err);
          toast({
            title: "Erro de localização",
            description: "Não conseguimos carregar as pessoas próximas.",
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
  }, [location, status, toast, currentUser?._id, page]);

  if (loading)
    return (
      <div className="p-4 text-center animate-pulse">
        Buscando pessoas próximas...
      </div>
    );

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">
            Pessoas Próximas
          </h2>
        </div>
        <Button variant="link" onClick={() => navigate("/dashboard/nearby")}>
          Ver todas →
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {users.length > 0 ? (
          users.map((p: any) => (
            <div
              key={p._id}
              className="relative min-w-[180px] w-[180px] rounded-xl overflow-hidden glass group flex-shrink-0"
            >
              <div className="relative h-52">
                <img
                  src={`${basicUrl}img/users/${p.profile?.photo || "default.jpg"}`}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                {p.isOnline && (
                  <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                )}
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm truncate">
                    {p.name.split(" ")[0]},{" "}
                    {p.profile?.birthDate
                      ? calculateAge(p.profile.birthDate)
                      : ""}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {p.distance}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 h-8 text-xs hover:bg-primary/10 hover:text-primary"
                    onClick={() => navigate(`/dashboard/details/${p._id}`)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> Perfil
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <Heart className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => navigate(`/dashboard/chat/${p._id}`)}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full p-8 text-center border-2 border-dashed rounded-xl border-muted">
            <p className="text-sm text-muted-foreground">
              Ninguém encontrado nesta área no momento.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyPeopleSection;
