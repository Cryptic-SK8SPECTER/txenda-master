import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import registerBg from "@/assets/register-bg.jpg"; 

const BrandingSection = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${registerBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60" />
      
      {/* Content */}
      <div className="relative z-10 p-12 max-w-lg">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-4xl font-bold mb-6 leading-tight">
            Entre para uma comunidade{" "}
            <span className="text-gradient">exclusiva</span>.
          </h1>
          
          <p className="text-foreground/70 text-lg mb-8">
            Perfis verificados, conexões reais e conteúdo premium em um
            ambiente seguro e discreto.
          </p>
          
          <div className="space-y-3">
            {[
              "+18 apenas",
              "Comunidade por subscrição",
              "Privacidade garantida",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BrandingSection;