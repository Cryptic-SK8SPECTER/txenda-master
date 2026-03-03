import { MapPin, Heart, MessageCircle, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const people = [
  {
    name: "Sofia",
    age: 26,
    distance: "2km",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop",
    verified: true,
    online: true,
  },
  {
    name: "Lucas",
    age: 29,
    distance: "3km",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    verified: true,
    online: false,
  },
  {
    name: "Marina",
    age: 24,
    distance: "5km",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
    verified: true,
    online: true,
  },
  {
    name: "André",
    age: 31,
    distance: "7km",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
    verified: false,
    online: false,
  },
  {
    name: "Clara",
    age: 27,
    distance: "1km",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
    verified: true,
    online: true,
  },
];

export const NearbyPeopleSection = () => {
  const navigate = useNavigate();
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
        {people.map((p) => (
          <div
            key={p.name}
            className="relative min-w-[180px] w-[180px] rounded-xl overflow-hidden glass group flex-shrink-0"
          >
            <div className="relative h-52">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              {p.online && (
                <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
              {p.verified && (
                <Badge className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-[10px] gap-1 px-1.5 py-0.5">
                  <ShieldCheck className="h-3 w-3" /> Verificado
                </Badge>
              )}
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">
                  {p.name}, {p.age}
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
