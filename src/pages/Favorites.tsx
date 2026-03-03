import { useState } from "react";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PersonCard, { Person } from "@/components/nearby/PersonCard";

const favoritesSample: Person[] = [
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
    name: "Marina",
    age: 24,
    distance: "5km",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop",
    verified: true,
    online: true,
    vip: true,
  },
  {
    name: "Clara",
    age: 27,
    distance: "1km",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=400&fit=crop",
    verified: true,
    online: true,
    sellsContent: true,
  },
];

const Favorites = () => {
  const [items] = useState<Person[]>(favoritesSample);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 backdrop-blur-md px-4 py-2">
        <Star className="h-5 w-5 text-gold" />
        <h1 className="font-display text-xl font-semibold">Favoritos</h1>
        <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>Lisboa • 3 km</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-20 glass rounded-xl">
            <p className="text-muted-foreground">
              Ainda não adicionaste favoritos.
            </p>
            <Button variant="link" className="text-primary mt-2">
              Explorar perfis →
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <PersonCard key={p.name} person={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
