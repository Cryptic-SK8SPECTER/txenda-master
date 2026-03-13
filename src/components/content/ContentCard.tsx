import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Camera,
  Video,
  Eye,
  Star,
  CreditCard,
  Gem,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp, basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";
import { purchaseService } from "@/services/purchaseService";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

const ContentCard = ({
  content,
  index,
  route,
}: {
  content: any;
  index: number;
  route: string;
}) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // ESTADO LOCAL PARA ACESSO
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  // Lógica de Identificação de Tipo
  const isSubscriberContent = content.visibility === "Exclusivo assinantes";
  const isPayPerView = content.visibility === "Pago individualmente";
  const isPublic = content.visibility === "Público";

  // Lógica de Bloqueio
  // 1. Bloqueado se for exclusivo e o user não for assinante (verificado)
  const needsSubscription = isSubscriberContent && !currentUser?.isVerified;

  // 2. Bloqueado se for PPV e o utilizador ainda não comprou
  const needsPayment = isPayPerView && !hasPurchased;

  const isLocked = needsSubscription || needsPayment;

  // Verificar acesso PPV ao carregar o card (apenas se for PPV e o user estiver logado)
  useEffect(() => {
    if (currentUser && isPayPerView) {
      const checkPPV = async () => {
        try {
          setCheckingAccess(true);
          const res = await purchaseService.checkAccess(content._id);
          setHasPurchased(res.hasAccess);
        } catch (error) {
          console.error("Erro ao verificar acesso PPV:", error);
        } finally {
          setCheckingAccess(false);
        }
      };
      checkPPV();
    }
  }, [content._id, currentUser, isPayPerView]);

  // Função para iniciar o checkout do Stripe para PPV
  const handlePayment = async () => {
    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Login necessário",
        description:
          "Precisa de entrar na sua conta para comprar este conteúdo.",
      });
      return;
    }

    try {
      setLoadingAccess(true);
      const res = await purchaseService.getCheckoutSession(content._id);

      if (res.session?.url) {
        window.location.href = res.session.url;
      } else {
        throw new Error("URL de checkout não encontrada.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description:
          error.response?.data?.message ||
          "Não foi possível iniciar o checkout.",
      });
    } finally {
      setLoadingAccess(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index % 4}
      className="glass rounded-xl overflow-hidden group hover:scale-[1.03] transition-all duration-300 hover:border-primary/30"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* Se o utilizador não for verificado, nunca mostramos a imagem/vídeo brutos */}
        {currentUser?.isVerified && !isLocked ? (
          <>
            {content.type === "photo" ? (
              <img
                src={`${basicUrl}img/contents/${content.url}`}
                alt={content.description}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <video
                src={`${basicUrl}img/contents/${content.url}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                muted
                loop
                autoPlay
                playsInline
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-black flex flex-col items-center justify-center gap-2 text-center px-4">
            <Lock className="w-8 h-8 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">
              Conteúdo protegido. Apenas utilizadores verificados podem visualizar a mídia.
            </p>
          </div>
        )}

        {/* Gradiente overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

        {/* --- LÓGICA DE OVERLAYS --- */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/40 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center border border-primary/30 shadow-xl">
              {loadingAccess || checkingAccess ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <Lock className="w-8 h-8 text-primary" />
              )}
            </div>

            {needsSubscription ? (
              <div className="space-y-3">
                <div className="flex flex-col items-center">
                  <Gem className="w-5 h-5 text-primary mb-1" />
                  <p className="text-foreground text-sm font-bold uppercase tracking-wider">
                    Exclusivo Assinantes
                  </p>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed max-w-[180px]">
                  Subscreva ao perfil de <b>{content.creator.name}</b> para
                  desbloquear este conteúdo.
                </p>
                <Button
                  variant="cta"
                  size="sm"
                  className="rounded-full w-full shadow-lg"
                  asChild
                >
                  <Link to={route}>Subscrever Agora</Link>
                </Button>
              </div>
            ) : needsPayment ? (
              <div className="space-y-3">
                <div className="flex flex-col items-center">
                  <CreditCard className="w-5 h-5 text-amber-500 mb-1" />
                  <p className="text-foreground text-sm font-bold uppercase tracking-wider">
                    Pay-Per-View
                  </p>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed max-w-[180px]">
                  Este conteúdo requer um pagamento único para acesso vitalício.
                </p>
                <Button
                  onClick={handlePayment}
                  disabled={loadingAccess}
                  className="rounded-full w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg"
                >
                  {loadingAccess ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    `Pagar ${content.price?.toFixed(2)} MZN`
                  )}
                </Button>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Badges superiores (Tipo e Views) - Só visíveis se não estiver bloqueado */}
        {!isLocked && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
              {content.type === "photo" ? (
                <Camera className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Video className="w-3.5 h-3.5 text-primary" />
              )}
              <span className="text-[10px] text-white font-bold uppercase tracking-tighter">
                {content.type === "photo" ? "Foto" : "Vídeo"}
              </span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-white/5">
              <Eye className="w-3.5 h-3.5 text-white/70" />
              <span className="text-[10px] text-white/70 font-bold">
                {content.views?.toLocaleString() || 0}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Informações do conteúdo (Sempre Visíveis) */}
      <div className="p-4 space-y-3 bg-card/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Star className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-bold text-foreground/90 truncate max-w-[100px]">
              {content.creator.name}
            </span>
          </div>

          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
              isPublic
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : isSubscriberContent
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            }`}
          >
            {content.visibility}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-1 italic">
          "{content.description || "Sem descrição..."}"
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-primary font-display font-black text-base">
            {content.price === 0 || isPublic
              ? "GRÁTIS"
              : `${content.price?.toFixed(2)} MZN`}
          </span>

          {!isLocked && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10 rounded-full"
                >
                  Ver agora
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] md:max-w-4xl max-h-[90vh] p-0 border-none bg-black overflow-hidden flex flex-col justify-center">
                {/* Título invisível para acessibilidade (radix ui exige um DialogTitle) */}
                <DialogTitle className="sr-only">Visualizar Conteúdo: {content.description}</DialogTitle>

                <div className="w-full h-full flex items-center justify-center relative">
                  {content.type === "photo" ? (
                    <img
                      src={`${basicUrl}img/contents/${content.url}`}
                      alt={content.description || "Visualização de conteúdo"}
                      className="max-w-full max-h-[90vh] object-contain rounded-md"
                    />
                  ) : (
                    <video
                      src={`${basicUrl}img/contents/${content.url}`}
                      controls
                      autoPlay
                      controlsList="nodownload"
                      className="max-w-full max-h-[90vh] object-contain rounded-md"
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
