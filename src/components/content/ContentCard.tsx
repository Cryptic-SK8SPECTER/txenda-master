import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Camera,
  Video,
  Eye,
  User,
  CreditCard,
  Gem,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp, basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext";
import { purchaseService } from "@/services/purchaseService";
import { contentService } from "@/services/contentService";
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

  const [hasPurchased, setHasPurchased] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isSubscriberContent = content.visibility === "Exclusivo assinantes";
  const isPayPerView = content.visibility === "Pago individualmente";
  const isPublic = content.visibility === "Público";

  const needsSubscription = isSubscriberContent && !currentUser?.isVerified;
  const needsPayment = isPayPerView && !hasPurchased;
  const isAlwaysVisible = isPublic;
  const isLocked = !isAlwaysVisible && (needsSubscription || needsPayment);

  const [hasRegisteredView, setHasRegisteredView] = useState(false);

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

  const visibilityBadgeStyles = isPublic
    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    : isSubscriberContent
      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
      : "bg-amber-500/20 text-amber-300 border border-amber-500/30";

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={index % 4}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        aspectRatio: "3/4",
        boxShadow: isHovered
          ? "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)"
          : "0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
        transform: isHovered ? "scale(1.03)" : "scale(1)",
        transition:
          "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
      }}
    >
      {/* ── BACKGROUND MEDIA ── */}
      <div className="absolute inset-0">
        {isAlwaysVisible || (currentUser?.isVerified && !isLocked) ? (
          content.type === "photo" ? (
            <img
              src={`${basicUrl}img/contents/${content.url}`}
              alt={content.description}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <video
              src={`${basicUrl}img/contents/${content.url}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              muted
              loop
              autoPlay
              playsInline
            />
          )
        ) : (
          /* Locked state – dark blurred background */
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        )}
      </div>

      {/* ── GRADIENT OVERLAYS ── */}
      {/* Bottom gradient – always present for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.0) 70%)",
        }}
      />
      {/* Top gradient – subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 35%)",
        }}
      />

      {/* ── TOP BADGES ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        {/* Type badge */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
          {content.type === "photo" ? (
            <Camera className="w-3 h-3 text-white/80" />
          ) : (
            <Video className="w-3 h-3 text-white/80" />
          )}
          <span className="text-[9px] text-white/80 font-bold uppercase tracking-widest">
            {content.type === "photo" ? "Foto" : "Vídeo"}
          </span>
        </div>

        {/* Views – only when unlocked */}
        {!isLocked && (
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
            <Eye className="w-3 h-3 text-white/60" />
            <span className="text-[9px] text-white/60 font-bold">
              {content.views?.toLocaleString() || 0}
            </span>
          </div>
        )}
      </div>

      {/* ── LOCKED OVERLAY ── */}
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 backdrop-blur-sm bg-black/50 flex flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border border-white/15"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {loadingAccess || checkingAccess ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Lock className="w-6 h-6 text-white/80" />
            )}
          </div>

          {needsSubscription ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-1">
                <Gem className="w-4 h-4 text-violet-400" />
                <p className="text-white text-[11px] font-black uppercase tracking-widest">
                  Exclusivo Assinantes
                </p>
              </div>
              <p className="text-white/50 text-[10px] leading-relaxed max-w-[160px]">
                Subscreva{" "}
                <b className="text-white/70">{content.creator.name}</b> para
                desbloquear este conteúdo.
              </p>
              <Button
                asChild
                className="rounded-full w-full text-[10px] font-black uppercase tracking-widest h-8 bg-white text-black hover:bg-white/90"
              >
                <Link to={route}>Subscrever Agora</Link>
              </Button>
            </div>
          ) : needsPayment ? (
            <div className="space-y-3">
              <p className="text-white/50 text-[10px] leading-relaxed max-w-[160px]">
                Pagamento único para acesso vitalício.
              </p>
              <Button
                onClick={handlePayment}
                disabled={loadingAccess}
                className="rounded-full w-full text-[10px] font-black uppercase tracking-widest h-8 bg-amber-500 hover:bg-amber-400 "
              >
                {loadingAccess ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  `Pagar ${content.price?.toFixed(2)} MZN`
                )}
              </Button>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* ── BOTTOM CONTENT (always visible) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 space-y-2">
        {/* Visibility badge */}
        <div className="flex justify-end">
          <span
            className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${visibilityBadgeStyles}`}
          >
            {content.visibility}
          </span>
        </div>

        {/* Title (description) — always visible */}
        <small
          className="text-white font-black leading-tight tracking-tight line-clamp-2"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: "1.2rem",
          }}
        >
          {content.description || "Sem título"}
        </small>

        {/* Creator name — clickable, links to details */}
        <Link
          to={route}
          className="flex items-center gap-1.5 w-fit group/creator"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <User className="w-2.5 h-2.5 text-white/70" />
          </div>
          <span className="text-white/60 text-[10px] font-semibold group-hover/creator:text-white transition-colors duration-200 underline-offset-2 group-hover/creator:underline truncate max-w-[120px]">
            {content.creator.name}
          </span>
        </Link>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1">
          <span
            className="font-black text-white"
            style={{ fontFamily: "'Georgia', serif", fontSize: "0.95rem" }}
          >
            {content.price === 0 || isPublic
              ? "GRÁTIS"
              : `${content.price?.toFixed(2)} MZN`}
          </span>

          {!isLocked && (
            <Dialog
              onOpenChange={async (open) => {
                if (open && !hasRegisteredView) {
                  try {
                    await contentService.incrementViews(content._id);
                    setHasRegisteredView(true);
                  } catch (e) {
                    console.error("Erro ao incrementar visualizações:", e);
                  }
                }
              }}
            >
              <DialogTrigger asChild>
                <button className="text-[9px] font-black uppercase tracking-widest text-white/80 hover:text-white border border-white/20 hover:border-white/50 rounded-full px-3 py-1 transition-all duration-200 hover:bg-white/10">
                  Ver agora
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] md:max-w-4xl max-h-[90vh] p-0 border-none bg-black overflow-hidden flex flex-col justify-center">
                <DialogTitle className="sr-only">
                  Visualizar Conteúdo: {content.description}
                </DialogTitle>
                <div className="w-full h-full flex items-center justify-center">
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
