import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import {
  Check,
  Crown,
  Zap,
  Infinity,
  Star,
  ShieldCheck,
  Gem,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SubscriptionPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0a0a0a] text-white">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
            {/* Header da Seção */}
            <div className="text-center py-12 px-4 space-y-4">
              <Badge
                variant="outline"
                className="border-primary/50 text-primary px-4 py-1 rounded-full uppercase tracking-widest text-[10px] bg-primary/5"
              >
                Experiência Exclusive
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                Escolha seu nível de acesso
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Desbloqueie conexões reais e conteúdos de elite com total
                discrição e segurança.
              </p>
            </div>

            {/* Grid de Planos */}
            <div className="px-4 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Plano Standard */}
              <Card className="relative p-8 bg-card/40 border-border backdrop-blur-sm flex flex-col hover:border-white/20 transition-colors">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">Standard</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">MZN19,90</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <BenefitItem
                    icon={<Check className="text-green-500" />}
                    label="Acesso à comunidade"
                  />
                  <BenefitItem
                    icon={<Check className="text-green-500" />}
                    label="Até 5 fotos por mês"
                  />
                  <BenefitItem
                    icon={<Check className="text-green-500" />}
                    label="Até 2 vídeos por mês"
                  />
                  <BenefitItem
                    icon={<Check className="text-muted-foreground/50" />}
                    label="Mensagens limitadas"
                    muted
                  />
                  <BenefitItem
                    icon={<Check className="text-muted-foreground/50" />}
                    label="Visibilidade padrão"
                    muted
                  />
                </ul>

                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl border-primary/20 hover:bg-primary/10"
                >
                  Escolher Plano
                </Button>
              </Card>

              {/* Plano VIP (Destaque Central) */}
              <Card className="relative p-8 bg-[#111] border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)] flex flex-col scale-105 z-10 overflow-hidden">
                {/* Efeito de brilho de fundo */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full" />

                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-500 text-black font-bold border-none">
                    RECOMENDADO
                  </Badge>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Crown className="h-5 w-5 fill-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-tighter">
                      Ultimate Access
                    </span>
                  </div>
                  <h3 className="text-2xl font-black mb-2 italic">VIP ELITE</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-amber-500">
                      MZN79,90
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <BenefitItem
                    icon={<Infinity className="text-amber-500 h-4 w-4" />}
                    label="Acesso total e ilimitado"
                    highlight
                  />
                  <BenefitItem
                    icon={<Infinity className="text-amber-500 h-4 w-4" />}
                    label="Fotos ilimitadas"
                    highlight
                  />
                  <BenefitItem
                    icon={<Infinity className="text-amber-500 h-4 w-4" />}
                    label="Vídeos ilimitados"
                    highlight
                  />
                  <BenefitItem
                    icon={
                      <Star className="text-amber-500 h-4 w-4 fill-amber-500" />
                    }
                    label="Perfil em destaque topo feed"
                  />
                  <BenefitItem
                    icon={<Gem className="text-amber-500 h-4 w-4" />}
                    label="Selo VIP Verificado"
                  />
                  <BenefitItem
                    icon={
                      <Zap className="text-amber-500 h-4 w-4 fill-amber-500" />
                    }
                    label="Acesso antecipado a lançamentos"
                  />
                </ul>

                <Button className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg shadow-lg shadow-amber-500/20">
                  Assinar Agora VIP
                </Button>
              </Card>

              {/* Plano Premium */}
              <Card className="relative p-8 bg-card/40 border-border backdrop-blur-sm flex flex-col hover:border-white/20 transition-colors">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2 text-primary">
                    Premium
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">MZN39,90</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <BenefitItem
                    icon={<Check className="text-primary" />}
                    label="Acesso completo à comunidade"
                  />
                  <BenefitItem
                    icon={<Check className="text-primary" />}
                    label="Até 20 fotos por mês"
                  />
                  <BenefitItem
                    icon={<Check className="text-primary" />}
                    label="Até 10 vídeos por mês"
                  />
                  <BenefitItem
                    icon={<Check className="text-primary" />}
                    label="Mensagens ilimitadas"
                  />
                  <BenefitItem
                    icon={<Check className="text-primary" />}
                    label="Prioridade no feed"
                  />
                </ul>

                <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold">
                  Escolher Plano
                </Button>
              </Card>
            </div>

            {/* Garantias de Confiança */}
            <div className="mt-16 max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center border-t border-white/5 pt-12">
              <div className="flex flex-col items-center gap-2">
                <ShieldCheck className="h-8 w-8 text-muted-foreground opacity-50" />
                <h4 className="font-bold text-sm uppercase tracking-tighter">
                  Pagamento Anónimo
                </h4>
                <p className="text-xs text-muted-foreground text-balance">
                  Faturação discreta em todos os extratos.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Star className="h-8 w-8 text-muted-foreground opacity-50" />
                <h4 className="font-bold text-sm uppercase tracking-tighter">
                  Conteúdo Curado
                </h4>
                <p className="text-xs text-muted-foreground text-balance">
                  Perfis e conteúdos verificados manualmente.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Zap className="h-8 w-8 text-muted-foreground opacity-50" />
                <h4 className="font-bold text-sm uppercase tracking-tighter">
                  Cancelamento Fácil
                </h4>
                <p className="text-xs text-muted-foreground text-balance">
                  Sem contratos, cancele online quando quiser.
                </p>
              </div>
            </div>
          </main>

          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

// Componente auxiliar para os itens de benefício
const BenefitItem = ({
  icon,
  label,
  muted = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  muted?: boolean;
  highlight?: boolean;
}) => (
  <li
    className={`flex items-center gap-3 text-sm ${muted ? "text-muted-foreground/40" : "text-muted-foreground"}`}
  >
    <div className="flex-shrink-0">{icon}</div>
    <span className={highlight ? "text-white font-bold" : ""}>{label}</span>
  </li>
);

export default SubscriptionPage;
