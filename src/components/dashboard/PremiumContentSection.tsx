import { Diamond, Lock, Play, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const content = [
  {
    seller: "Sofia M.",
    type: "Foto",
    price: "MZN4,99",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    count: 5,
  },
  {
    seller: "Marina L.",
    type: "Vídeo",
    price: "MZN9,99",
    img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop",
    count: 1,
  },
  {
    seller: "Clara R.",
    type: "Foto",
    price: "MZN3,49",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop",
    count: 8,
  },
  {
    seller: "Julia T.",
    type: "Vídeo",
    price: "MZN12,99",
    img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop",
    count: 3,
  },
];

const PremiumContentSection = () => {
  const navigate = useNavigate();
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Diamond className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">
            Conteúdo Premium
          </h2>
        </div>
        <Button
          variant="link"
          className="text-primary text-sm"
          onClick={() => navigate("/dashboard/premium")}
        >
          Explorar →
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {content.map((c, i) => (
          <div
            key={i}
            className="relative rounded-xl overflow-hidden glass group cursor-pointer"
          >
            <div className="relative aspect-square">
              <img
                src={c.img}
                alt={c.seller}
                className="w-full h-full object-cover blur-lg group-hover:blur-xl transition-all"
              />
              <div className="absolute inset-0 bg-background/40 flex flex-col items-center justify-center gap-2">
                <Lock className="h-8 w-8 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  Conteúdo Exclusivo
                </span>
              </div>
              <Badge className="absolute top-2 left-2 bg-secondary/80 text-foreground text-[10px] gap-1">
                {c.type === "Vídeo" ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Image className="h-3 w-3" />
                )}
                {c.type} • {c.count}
              </Badge>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-sm font-medium">{c.seller}</span>
              <Button
                size="sm"
                className="h-7 text-xs btn-gradient text-primary-foreground"
              >
                {c.price}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PremiumContentSection;
