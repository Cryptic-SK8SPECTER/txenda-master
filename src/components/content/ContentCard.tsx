import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Camera, Video, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fadeUp, basicUrl } from "@/utils/index";

const ContentCard = ({ content, index, isLocked }) => {
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
          {/* Imagem de preview */}
          <img
            src={`${basicUrl}img/contents/${content.url}`}
            alt={content.description}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              isLocked ? "blur-lg scale-110" : ""
            }`}
          />
          
          {/* Gradiente overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
  
          {/* Overlay de conteúdo bloqueado */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground/90 text-sm text-center font-medium">
                Conteúdo exclusivo para membros.
              </p>
              <Button variant="cta" size="sm" className="rounded-full text-xs px-6" asChild>
                <Link to="/subscription">Desbloquear com Subscrição</Link>
              </Button>
            </motion.div>
          )}
  
          {/* Badge de tipo de conteúdo */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/70 backdrop-blur-md rounded-full px-3 py-1">
            {content.type === "photo" ? (
              <Camera className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Video className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="text-xs text-foreground/80 capitalize">
              {content.type === "photo" ? "Foto" : "Vídeo"}
            </span>
          </div>
  
          {/* Badge de visualizações */}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/70 backdrop-blur-md rounded-full px-3 py-1">
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {content.views?.toLocaleString() || 0}
            </span>
          </div>
        </div>
  
        {/* Informações do conteúdo */}
        <div className="p-4 space-y-2">
          {/* Criador */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {content.creator.name}
            </span>
          </div>
  
          {/* Descrição */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content.description}
          </p>
  
          {/* Preço e visibilidade */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-primary font-display font-bold text-lg">
              {content.price === 0 ? "Grátis" : `${content.price?.toFixed(2) || '0.00'} MZN`}
            </span>
            
            <span 
              className={`text-xs px-2 py-0.5 rounded-full ${
                content.visibility === "Público"
                  ? "bg-green-500/10 text-green-400"
                  : content.visibility === "Exclusivo assinantes"
                    ? "bg-primary/10 text-primary"
                    : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {content.visibility}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

export default ContentCard;