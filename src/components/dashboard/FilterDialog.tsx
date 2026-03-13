import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  User,
  Target,
  Diamond,
  Star,
  ShoppingCart,
  Video,
  Flame,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { type FilterState, defaultFilters } from "@/types/filters";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

const quickFilters = [
  { icon: Flame, label: "Disponíveis Agora", color: "text-orange-400" },
  { icon: MapPin, label: "Perto de Mim", color: "text-blue-400" },
  { icon: ShieldCheck, label: "Verificados", color: "text-green-400" },
  { icon: Video, label: "Conteúdo Premium", color: "text-primary" },
];

const FilterDialog = ({
  open,
  onOpenChange,
  filters,
  onApplyFilters,
}: FilterDialogProps) => {
  const [local, setLocal] = useState<FilterState>(filters);

  // Sync when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (o) setLocal(filters);
    onOpenChange(o);
  };

  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  const toggleInList = (
    key:
      | "quickFilters"
      | "intentions"
      | "profileTypes"
      | "popularity"
      | "categories",
    item: string,
  ) =>
    setLocal((prev) => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter((i) => i !== item)
        : [...prev[key], item],
    }));

  const clearAll = () => {
    // 1. Criamos o estado limpo
    const resetFilters = { ...defaultFilters };

    // 2. Atualizamos o estado visual do Dialog
    setLocal(resetFilters);

    // 3. APLICAMOS IMEDIATAMENTE ao pai (DashboardHome)
    onApplyFilters(resetFilters);

    // 4. (Opcional) Fecha o Dialog automaticamente após limpar
    onOpenChange(false);
  };

  const handleApply = () => {
    onApplyFilters(local);
    onOpenChange(false);
  };

  const intentions = [
    "Apenas conversar",
    "Encontros presenciais",
    "Experiências discretas",
    "Longo prazo",
    "Conteúdo online",
    "Ambos",
  ];

  const profileTypes = [
    "Apenas verificados",
    "Perfis premium",
    "Avaliações positivas",
    "Fotos públicas",
    "Conteúdo à venda",
  ];

  const categories = [
    "Exclusivo",
    "Recente",
    "Popular",
    "Conteúdo privado",
    "Personalizado",
  ];

  const popularityOptions = [
    "Mais visualizados",
    "Mais bem avaliados",
    "Novos membros",
    "Mais ativos",
  ];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md border-border bg-background p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filtros
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Limpar
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-5">
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 pb-4">
            {quickFilters.map((qf) => {
              const active = local.quickFilters.includes(qf.label);
              return (
                <button
                  key={qf.label}
                  onClick={() => toggleInList("quickFilters", qf.label)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    active
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <qf.icon
                    className={`h-3.5 w-3.5 ${active ? "text-primary" : qf.color}`}
                  />
                  {qf.label}
                </button>
              );
            })}
          </div>

          <Separator className="mb-5" />

          {/* Location */}
          <Section icon={MapPin} title="Localização">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">
                    Raio de distância
                  </Label>
                  <span className="text-xs font-semibold text-primary">
                    {local.distance} km
                  </span>
                </div>
                <Slider
                  value={[local.distance]}
                  onValueChange={([v]) => update("distance", v)}
                  min={1}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between mt-1.5">
                  {[5, 10, 25, 50].map((d) => (
                    <button
                      key={d}
                      onClick={() => update("distance", d)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        local.distance === d
                          ? "bg-primary/20 border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {d}km
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Cidade
                  </Label>
                  <Input
                    placeholder="Ex: Lisboa"
                    className="h-8 text-xs bg-secondary border-border"
                    value={local.city}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    País
                  </Label>
                  <Select
                    value={local.country}
                    onValueChange={(v) => update("country", v)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-secondary border-border">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Portugal</SelectItem>
                      <SelectItem value="br">Brasil</SelectItem>
                      <SelectItem value="es">Espanha</SelectItem>
                      <SelectItem value="fr">França</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-5" />

          {/* Personal Data */}
          <Section icon={User} title="Dados Pessoais">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Idade</Label>
                  <span className="text-xs font-semibold text-primary">
                    {local.ageRange[0]} – {local.ageRange[1]} anos
                  </span>
                </div>
                <Slider
                  value={local.ageRange}
                  onValueChange={(v) =>
                    update("ageRange", v as [number, number])
                  }
                  min={18}
                  max={65}
                  step={1}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Género
                  </Label>
                  <Select
                    value={local.gender}
                    onValueChange={(v) => update("gender", v)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-secondary border-border">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="m">Masculino</SelectItem>
                      <SelectItem value="f">Feminino</SelectItem>
                      <SelectItem value="nb">Não-binário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Estado
                  </Label>
                  <Select
                    value={local.status}
                    onValueChange={(v) => update("status", v)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-secondary border-border">
                      <SelectValue placeholder="Qualquer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer</SelectItem>
                      <SelectItem value="online">Online agora</SelectItem>
                      <SelectItem value="today">Disponível hoje</SelectItem>
                      <SelectItem value="weekend">
                        Disponível este fim de semana
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Section>

          <Separator className="my-5" />

          {/* Intention */}
          <Section icon={Target} title="Intenção / Objetivo">
            <div className="flex flex-wrap gap-2">
              {intentions.map((intent) => {
                const active = local.intentions.includes(intent);
                return (
                  <button
                    key={intent}
                    onClick={() => toggleInList("intentions", intent)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                      active
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {intent}
                  </button>
                );
              })}
            </div>
          </Section>

          <Separator className="my-5" />

          {/* Profile Type */}
          <Section icon={Diamond} title="Tipo de Perfil">
            <div className="space-y-2.5">
              {profileTypes.map((pt) => (
                <label
                  key={pt}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <Checkbox
                    checked={local.profileTypes.includes(pt)}
                    onCheckedChange={() => toggleInList("profileTypes", pt)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {pt}
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Separator className="my-5" />

          {/* Popularity */}
          <Section icon={Star} title="Popularidade">
            <div className="flex flex-wrap gap-2">
              {popularityOptions.map((opt) => {
                const active = local.popularity.includes(opt);
                return (
                  <Badge
                    key={opt}
                    variant="outline"
                    onClick={() => toggleInList("popularity", opt)}
                    className={`cursor-pointer transition-all text-xs ${
                      active
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {opt}
                  </Badge>
                );
              })}
            </div>
          </Section>

          <Separator className="my-5" />

          {/* Premium Content Filters */}
          <Section icon={ShoppingCart} title="Conteúdo Premium">
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Tipo de conteúdo
                </Label>
                <div className="flex gap-2">
                  {["fotos", "vídeos", "ambos"].map((t) => (
                    <button
                      key={t}
                      onClick={() => update("contentType", t)}
                      className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium border transition-all capitalize ${
                        local.contentType === t
                          ? "bg-primary/20 border-primary text-primary"
                          : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t === "fotos" ? "📷 " : t === "vídeos" ? "🎥 " : "📷🎥 "}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Preço</Label>
                  <span className="text-xs font-semibold text-primary">
                    {local.priceRange[0].toLocaleString()} MZN –{" "}
                    {local.priceRange[1].toLocaleString()} MZN
                  </span>
                </div>
                <Slider
                  value={local.priceRange}
                  onValueChange={(v) =>
                    update("priceRange", v as [number, number])
                  }
                  min={0}
                  max={100000}
                  step={50}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Categoria
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = local.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        onClick={() => toggleInList("categories", cat)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                          active
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Avaliação do criador
                </Label>
                <div className="flex gap-2">
                  {["4+ estrelas", "5 estrelas"].map((r) => (
                    <Badge
                      key={r}
                      variant="outline"
                      onClick={() =>
                        update(
                          "creatorRating",
                          local.creatorRating === r ? "" : r,
                        )
                      }
                      className={`cursor-pointer transition-all text-xs gap-1 ${
                        local.creatorRating === r
                          ? "border-primary text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Data
                </Label>
                <Select
                  value={local.contentDate}
                  onValueChange={(v) => update("contentDate", v)}
                >
                  <SelectTrigger className="h-8 text-xs bg-secondary border-border">
                    <SelectValue placeholder="Qualquer período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Conteúdo recente</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Separator className="my-5" />

          {/* Advanced (Premium Lock) */}
          <div className="glass rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                Filtros Avançados
              </span>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                Premium
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Altura",
                "Tipo físico",
                "Idioma",
                "Horário",
                "Encontros pagos",
                "Vende conteúdo",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50"
                >
                  <Lock className="h-3 w-3" />
                  {f}
                </div>
              ))}
            </div>
            <Button
              size="sm"
              className="w-full mt-3 btn-gradient text-primary-foreground text-xs h-8"
            >
              💎 Desbloquear Filtros Premium
            </Button>
          </div>
        </ScrollArea>

        <SheetFooter className="px-5 py-4 border-t border-border bg-background">
          <div className="w-full space-y-2">
            <Button
              className="w-full btn-gradient text-primary-foreground font-semibold"
              onClick={handleApply}
            >
              Aplicar Filtros
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </div>
    {children}
  </div>
);

export default FilterDialog;
