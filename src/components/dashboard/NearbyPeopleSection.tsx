import { MapPin, Heart, MessageCircle, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { userService } from "@/services/userService";
import   { useToast } from "@/hooks/use-toast";
import { basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";



export const NearbyPeopleSection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
   const { calculateAge } = useAuth();

  const { toast } = useToast();

  useEffect(() => {
    const fechUsers = async () => {
      setLoading(true); // Ativa o skeleton
      try {
        const res = await userService.getAllUsers();

        const users = res.data?.data;
        setUsers(users)
        console.log("Resposta USuarios  ", users);
      } catch (err) {
        console.error("Erro no fetch:", err);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar os conteúdos.",
          variant: "destructive",
        });
      } finally {
        // ESTA LINHA É OBRIGATÓRIA PARA O SKELETON SUMIR
        setLoading(false);
      }
    };

    fechUsers();
  }, []);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">
            Pessoas Próximas
          </h2>
        </div>
        <Button
          variant="link"
          className="text-primary text-sm"
          onClick={() => navigate("/dashboard/nearby")}
        >
          Ver todas →
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {users.map((p) => (
          <div
            key={p.name}
            className="relative min-w-[180px] w-[180px] rounded-xl overflow-hidden glass group flex-shrink-0"
          >
            <div className="relative h-52">
              <img
                src={`${basicUrl}img/users/${p.profile?.photo}`}
                alt={p.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              {p.online && (
                <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
              {p.isVerified && (
                <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-[10px] gap-1 px-1.5 py-0.5">
                  <ShieldCheck className="h-3 w-3" /> Verificado
                </Badge>
              )}
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  {p.name},{" "}
                  {p.profile?.birthDate
                    ? calculateAge(p?.profile?.birthDate)
                    : " "}
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
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
                >
                  <Heart className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
  // close the component function
};

export default NearbyPeopleSection;
