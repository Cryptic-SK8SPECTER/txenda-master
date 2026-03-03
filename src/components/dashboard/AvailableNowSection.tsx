import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const available = [
  { name: "Julia", age: 25, img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&h=120&fit=crop" },
  { name: "Rafael", age: 28, img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop" },
  { name: "Camila", age: 23, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop" },
  { name: "Thiago", age: 30, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop" },
  { name: "Beatriz", age: 26, img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop" },
  { name: "Diego", age: 27, img: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&h=120&fit=crop" },
];

const AvailableNowSection = () => (
  <section>
    <div className="flex items-center gap-2 mb-4">
      <Zap className="h-5 w-5 text-gold" />
      <h2 className="font-display text-xl font-semibold">Disponíveis Agora</h2>
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">LIVE</Badge>
    </div>
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {available.map((p) => (
        <button
          key={p.name}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary to-gold">
              <img
                src={p.img}
                alt={p.name}
                className="w-full h-full rounded-full object-cover border-2 border-background"
              />
            </div>
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            {p.name}, {p.age}
          </span>
        </button>
      ))}
    </div>
  </section>
);

export default AvailableNowSection;
