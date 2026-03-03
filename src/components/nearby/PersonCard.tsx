import { MapPin, Heart, MessageCircle, Eye, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Person {
  name: string;
  age: number;
  distance: string;
  img: string;
  verified?: boolean;
  online?: boolean;
  availableToday?: boolean;
  vip?: boolean;
  sellsContent?: boolean;
}

interface PersonCardProps {
  person: Person;
}

const PersonCard = ({ person }: PersonCardProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden glass group">
      <div className="relative h-56">
        <img
          src={person.img}
          alt={person.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        {person.online && (
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
          <span className="font-semibold text-sm">
            {person.name}, {person.age}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {person.distance}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          {person.availableToday && (
            <span className="text-orange-400">🔥 Disponível hoje</span>
          )}
          {person.sellsContent && (
            <span className="ml-auto">💰 Vende conteúdo</span>
          )}
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
  );
};

export default PersonCard;
