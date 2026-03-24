import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { getSocket } from "@/services/authService";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService"; // Importa o teu serviço
import { basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";
import { type FilterState } from "@/types/filters";

interface AvailableNowSectionProps {
  filters: FilterState;
}


const AvailableNowSection = ({ filters }: AvailableNowSectionProps) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: onlineUsers } = useQuery({
    // Adicionamos 'filters' aqui para que a query saiba que depende deles
    queryKey: ["online-creators", filters],
    queryFn: () => userService.getAllUsers(),
    select: (res) => {
      const allUsers = res.data.data || [];

      return allUsers.filter((u: any) => {
        // 1. Filtro base: Online e não ser o próprio utilizador
        if (!u.isOnline || u._id === currentUser?._id) return false;

        // 2. Filtro de Género
        if (
          filters.gender !== "all" &&
          u.profile?.gender?.toLowerCase() !== filters.gender.toLowerCase()
        ) {
          return false;
        }

        // 3. Filtro de Idade
        const age = u.profile?.birthDate
          ? Math.floor(
              (Date.now() - new Date(u.profile.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000),
            )
          : null;
        if (age == null) return false;
        if (age < filters.ageRange[0] || age > filters.ageRange[1])
          return false;

        // 4. Filtro de Verificados (quick filter e profile type)
        if (
          (filters.quickFilters.includes("Verificados") ||
            filters.profileTypes.includes("Apenas verificados")) &&
          !u.isVerified
        ) {
          return false;
        }

        // Quick filters
        if (filters.quickFilters.includes("Disponíveis Agora") && !u.isOnline) {
          return false;
        }

        // 5. Filtro por Cidade
        if (
          filters.city &&
          !u.profile?.location
            ?.toLowerCase()
            .includes(filters.city.toLowerCase())
        ) {
          return false;
        }

        // 6. País (faz match textual no campo location)
        if (
          filters.country &&
          !u.profile?.location
            ?.toLowerCase()
            .includes(filters.country.toLowerCase())
        ) {
          return false;
        }

        // 7. Intenções
        if (
          filters.intentions.length > 0 &&
          !filters.intentions.includes("Ambos")
        ) {
          const lookingFor = (u.profile?.lookingFor || "").toLowerCase();
          const matchesIntent = filters.intentions.some((intent) => {
            const i = intent.toLowerCase();
            if (i.includes("conteúdo")) return lookingFor.includes("conteudos");
            if (i.includes("encontro")) return lookingFor.includes("encontros");
            return lookingFor.includes("ambos");
          });
          if (!matchesIntent) return false;
        }

        // 8. Pesquisa textual
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          const nameMatch = u.name?.toLowerCase().includes(term);
          const locationMatch = u.profile?.location?.toLowerCase().includes(term);
          const bioMatch = u.profile?.bio?.toLowerCase().includes(term);
          if (!nameMatch && !locationMatch && !bioMatch) return false;
        }

        // 9. Estado
        if (filters.status === "online" && !u.isOnline) return false;
        if (filters.status === "today" && !u.isOnline) return false;
        if (filters.status === "weekend" && !u.isOnline) return false;

        return true;
      });
    },
  });
  
  // 2. OUVIR MUDANÇAS DE STATUS EM TEMPO REAL
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(
      "user_status_changed",
      (data: { userId: string; status: string }) => {
        // Invalida as queries para atualizar as listas automaticamente
        queryClient.invalidateQueries({ queryKey: ["online-creators"] });
        queryClient.invalidateQueries({ queryKey: ["nearby-users"] });
      },
    );

    return () => {
      socket.off("user_status_changed");
    };
  }, [queryClient]);

  // Se não houver ninguém online, podes retornar null ou uma mensagem
  if (!onlineUsers || onlineUsers.length === 0) return null;

  //  const filtered = available.filter((p) => {
  //    // Age range
  //    if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1])
  //      return false;
  //    // Gender
  //    if (filters.gender !== "all" && p.gender !== filters.gender) return false;
  //    // Verified
  //    if (filters.profileTypes.includes("Apenas verificados") && !p.verified)
  //      return false;
  //    // Quick filter: Verificados
  //    if (filters.quickFilters.includes("Verificados") && !p.verified)
  //      return false;
  //    return true;
  //  });

  //  if (filtered.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <h2 className="font-display text-xl font-semibold">
          Disponíveis Agora
        </h2>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] animate-pulse">
          LIVE
        </Badge>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {onlineUsers.map((user: any) => (
          <button
            key={user._id}
            className="flex flex-col items-center gap-2 min-w-[80px] group"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary to-yellow-500">
                <img
                  src={`${basicUrl}img/users/${user.profile?.photo}`}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover border-2 border-background"
                />
              </div>
              {/* Indicador de Online */}
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-20">
              {user.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default AvailableNowSection;
