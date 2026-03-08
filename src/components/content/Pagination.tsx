import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fadeUp } from "@/utils/index";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="flex items-center justify-center gap-2 mt-12"
    >
      {/* Botão Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Números das Páginas */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            page === currentPage
              ? "btn-gradient text-primary-foreground shadow-lg shadow-primary/25"
              : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botão Próximo */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

export default Pagination;