import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { locationService } from "@/services/locationService";
import { useAuth } from "@/context/AuthContext";
import { useGeolocation } from "@/hooks/use-geolocation";
import { type FilterState } from "@/types/filters";
import PersonCard, { type Person } from "@/components/nearby/PersonCard"; // Ajuste o caminho conforme o seu projeto

interface NearbyPeopleSectionProps {
  filters: FilterState;
}

export const NearbyPeopleSection = ({ filters }: NearbyPeopleSectionProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Person[]>([]); // Usando a interface Person
  const { user: currentUser } = useAuth();
  const { location, status } = useGeolocation();

  useEffect(() => {
    const updatePresence = async () => {
      if (status === "granted" && location) {
        try {
          await locationService.updateMyLocation(
            location.lng,
            location.lat,
            true,
          );
        } catch (err) {
          console.error("Erro ao atualizar presença geográfica:", err);
        }
      }
    };
    updatePresence();
  }, [location, status]);

  useEffect(() => {
    const fetchNearby = async () => {
      if (status === "granted" && location) {
        setLoading(true);
        try {
          const res = await locationService.getNearbyUsers(
            filters.distance,
            location.lat,
            location.lng,
            20,
            1,
          );

          const rawData = res.data?.data || [];

          const formattedUsers = rawData
            .filter((loc: any) => loc.user && loc.user._id !== currentUser?._id)
            .filter((loc: any) => {
              const u = loc.user;
              const profile = u.profile || {};

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

              // Verificados
              if (
                (filters.quickFilters.includes("Verificados") ||
                  filters.profileTypes.includes("Apenas verificados")) &&
                !u.isVerified
              ) {
                return false;
              }

              // Cidade/País no campo location textual
              if (
                filters.city &&
                !profile.location?.toLowerCase().includes(filters.city.toLowerCase())
              ) {
                return false;
              }

              if (
                filters.country &&
                !profile.location
                  ?.toLowerCase()
                  .includes(filters.country.toLowerCase())
              ) {
                return false;
              }

              // Pesquisa textual
              if (filters.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                const match =
                  u.name?.toLowerCase().includes(term) ||
                  profile.location?.toLowerCase().includes(term) ||
                  profile.bio?.toLowerCase().includes(term);
                if (!match) return false;
              }

              // Estado
              if (filters.status === "online" && !u.isOnline) return false;
              if (filters.status === "today" && !u.isOnline) return false;
              if (filters.status === "weekend" && !u.isOnline) return false;

              // Quick filters
              if (
                filters.quickFilters.includes("Disponíveis Agora") &&
                !u.isOnline
              ) {
                return false;
              }
              if (filters.quickFilters.includes("Perto de Mim")) {
                const km = Number(loc.distance || 0);
                if (Number.isFinite(km) && km > 10) return false;
              }

              // Intenções
              if (
                filters.intentions.length > 0 &&
                !filters.intentions.includes("Ambos")
              ) {
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
            })
            .map(
              (loc: any): Person => ({
                ...loc.user,
                verified: loc.user.isVerified, // Mapeia isVerified para verified
                distance: loc.distance
                  ? `${loc.distance.toFixed(1)} km`
                  : "Perto de você",
              }),
            );

          setUsers(formattedUsers);
        } catch (err) {
          console.error("Erro ao buscar próximos:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchNearby();
  }, [location, status, filters, currentUser?._id]);

  if (loading) return <LoadingSkeleton />;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">
            Pessoas Próximas
          </h2>
          {users.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
              {users.length} encontradas
            </span>
          )}
        </div>
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate("/dashboard/nearby")}
          className="text-primary"
        >
          Ver todas →
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
        {users.length > 0 ? (
          users.map((p) => (
            <div key={p._id} className="min-w-[180px] w-[180px] flex-shrink-0">
              <PersonCard person={p} />
            </div>
          ))
        ) : (
          <EmptyState onExplore={() => navigate("/dashboard/nearby")} />
        )}
      </div>
    </section>
  );
};

// Sub-componentes para limpar o código principal
const LoadingSkeleton = () => (
  <div className="p-8 text-center glass rounded-xl animate-pulse flex flex-col items-center gap-3">
    <MapPin className="h-6 w-6 text-primary animate-bounce" />
    <p className="text-sm text-muted-foreground font-medium">
      Procurando pessoas por perto...
    </p>
  </div>
);

const EmptyState = ({ onExplore }: { onExplore: () => void }) => (
  <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-border bg-secondary/20">
    <MapPin className="h-8 w-8 text-muted-foreground/40 mb-2" />
    <p className="text-sm text-muted-foreground font-medium text-center px-4">
      Nenhum resultado para estes filtros.
    </p>
    <Button
      variant="outline"
      size="sm"
      className="mt-4 h-8 text-xs"
      onClick={onExplore}
    >
      Explorar outras áreas
    </Button>
  </div>
);

export default NearbyPeopleSection;
