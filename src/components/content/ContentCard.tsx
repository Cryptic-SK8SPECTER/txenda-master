import React from "react";
import { motion } from "framer-motion";
import { Lock, Camera, Video, Eye, Star, CreditCard, Gem } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp, basicUrl } from "@/utils/index";
import { useAuth } from "@/context/AuthContext"; // Importando o contexto de autenticação

const ContentCard = ({ content, index, route }) => {
  const { user: currentUser } = useAuth();

  // Lógica de Acesso
  const isSubscriberContent = content.visibility === "Exclusivo assinantes";
  const isPayPerView = content.visibility === "Pago individualmente";
  const isPublic = content.visibility === "Público";

  // O conteúdo está bloqueado para subscrição se: for exclusivo e o user não for verificado/assinante
  const needsSubscription = isSubscriberContent && !currentUser?.isVerified;

  // O conteúdo está bloqueado para pagamento se: for pago individualmente
  // (Aqui você pode adicionar uma lógica extra: && !currentUser.boughtContents.includes(content._id))
  const needsPayment = isPayPerView;

  const isLocked = needsSubscription || needsPayment;

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
        {/* Imagem de preview com blur se estiver bloqueado */}
        <img
          src={`${basicUrl}img/contents/${content.url}`}
          alt={content.description}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            isLocked ? "blur-2xl scale-125 saturate-150" : ""
          }`}
        />

        {/* Gradiente overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

        {/* --- LÓGICA DE OVERLAYS --- */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/40 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6"
          >
            <div className="w-16 h-16 rounded-full bg-background/80 flex items-center justify-center border border-primary/30 shadow-xl">
              <Lock className="w-8 h-8 text-primary animate-pulse" />
            </div>

            {needsSubscription ? (
              <div className="text-center space-y-3">
                <div className="flex flex-col items-center">
                  <Gem className="w-5 h-5 text-primary mb-1" />
                  <p className="text-foreground text-sm font-bold uppercase tracking-wider">
                    Exclusivo Assinantes
                  </p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Subscreva ao perfil de {content.creator.name} para desbloquear
                  este conteúdo.
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
              <div className="text-center space-y-3">
                <div className="flex flex-col items-center">
                  <CreditCard className="w-5 h-5 text-yellow-500 mb-1" />
                  <p className="text-foreground text-sm font-bold uppercase tracking-wider">
                    Conteúdo Premium
                  </p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Este conteúdo requer um pagamento único para visualização.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  asChild
                >
                  <Link to={`/checkout/${content._id}`}>
                    Pagar {content.price?.toFixed(2)} MZN
                  </Link>
                </Button>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Badges superiores (Tipo e Views) */}
        {!isLocked && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
              {content.type === "photo" ? (
                <Camera className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Video className="w-3.5 h-3.5 text-primary" />
              )}
              <span className="text-[10px] text-white font-bold uppercase">
                {content.type === "photo" ? "Foto" : "Vídeo"}
              </span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-full px-3 py-1">
              <Eye className="w-3.5 h-3.5 text-white/70" />
              <span className="text-[10px] text-white/70 font-bold">
                {content.views?.toLocaleString() || 0}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Informações do conteúdo (Sempre Visíveis) */}
      <div className="p-4 space-y-3">
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
                  : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
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
            {content.price === 0
              ? "GRÁTIS"
              : `${content.price?.toFixed(2)} MZN`}
          </span>

          {!isLocked && (
            <Button
              variant="ghost"
              size="xs"
              className="h-7 text-[10px] uppercase font-bold text-primary hover:bg-primary/10"
            >
              Ver agora
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ContentCard;
