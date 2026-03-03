import { Sparkles, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const suggestions = [
  { name: "Letícia", age: 24, city: "Lisboa", interest: "Encontros", img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=200&fit=crop", match: 92 },
  { name: "Pedro", age: 28, city: "Porto", interest: "Conteúdo", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=200&fit=crop", match: 87 },
  { name: "Ana", age: 25, city: "Braga", interest: "Ambos", img: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=200&fit=crop", match: 95 },
];

const SuggestionsSection = () => (
  <section>
    <div className="flex items-center gap-2 mb-4">
      <Sparkles className="h-5 w-5 text-gold" />
      <h2 className="font-display text-xl font-semibold">Sugestões Para Si</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {suggestions.map((s) => (
        <div key={s.name} className="rounded-xl overflow-hidden glass group">
          <div className="relative h-36">
            <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <Badge className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-[10px]">
              {s.match}% match
            </Badge>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{s.name}, {s.age}</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {s.city}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{s.interest}</Badge>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-primary hover:bg-primary/10">
                <Heart className="h-3.5 w-3.5 mr-1" /> Conectar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default SuggestionsSection;
