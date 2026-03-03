import { useState } from "react";
import {
  MapPin,
  Bell,
  Filter,
  List as ListIcon,
  Map as MapIcon,
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
import PersonCard, { Person } from "@/components/nearby/PersonCard";
import MapView from "@/components/nearby/MapView";

const samplePeople: Person[] = [
  {
    name: "Sofia",
    age: 26,
    distance: "2km",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop",
    verified: true,
    online: true,
    availableToday: true,
  },
  {
    name: "Lucas",
    age: 29,
    distance: "3km",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    verified: true,
  },
  {
    name: "Marina",
    age: 24,
    distance: "5km",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
    verified: true,
    online: true,
    vip: true,
  },
  {
    name: "André",
    age: 31,
    distance: "7km",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
    sellsContent: true,
  },
  {
    name: "Clara",
    age: 27,
    distance: "1km",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
    verified: true,
    online: true,
    availableToday: true,
    sellsContent: true,
  },
];

const Nearby = () => {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [plan, setPlan] = useState<"standard" | "premium" | "vip">("standard");
  const [sortOption, setSortOption] = useState("mais_proximos");

  const filtered = samplePeople; // placeholder: in real use apply filters/sort

  const onlineCount = samplePeople.filter((p) => p.online).length;
  const newCount = 3;

  const limitReached = plan === "standard" && filtered.length > 5;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* top header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 backdrop-blur-md px-4 py-2">
        <div className="flex items-center gap-1">
          <MapPin className="h-5 w-5 text-primary" />
          <span>Lisboa, 3 km de você</span>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              2
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter className="h-4 w-4 mr-1" /> Filtrar
          </Button>
        </div>
      </header>

      {/* psychological indicators */}
      <div className="px-4 py-2 text-xs text-muted-foreground">
        {onlineCount} pessoas online agora perto de você • {newCount} perfis
        adicionados nas últimas 2 horas
      </div>

      {/* view toggle & sort */}
      <div className="flex items-center px-4 py-2 gap-2">
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="flex items-center gap-1"
        >
          <ListIcon className="h-4 w-4" /> Lista
        </Button>
        <Button
          variant={viewMode === "map" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("map")}
          className="flex items-center gap-1"
        >
          <MapIcon className="h-4 w-4" /> Mapa
        </Button>

        <div className="ml-auto w-40">
          <Select value={sortOption} onValueChange={(v) => setSortOption(v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mais_proximos">Mais próximos</SelectItem>
              <SelectItem value="online_agora">Online agora</SelectItem>
              <SelectItem value="melhor_avaliacao">Melhor avaliação</SelectItem>
              <SelectItem value="mais_populares">Mais populares</SelectItem>
              <SelectItem value="novos_perfis">Novos perfis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {viewMode === "map" ? (
          plan === "standard" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4">
                Modo mapa disponível apenas para planos Premium 🎯
              </p>
              <Button>Atualizar plano</Button>
            </div>
          ) : (
            <div className="flex-1 p-4">
              <MapView />
            </div>
          )
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-20">
            {plan === "standard" && (
              <div className="mb-3 text-xs text-muted-foreground">
                Planos Standard veem até 5 perfis por dia.{" "}
                <Button variant="link" className="text-primary text-xs">
                  Atualize
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(plan === "standard" ? filtered.slice(0, 5) : filtered).map(
                (p) => (
                  <PersonCard key={p.name} person={p} />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      <FilterDialog open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
};

export default Nearby;
