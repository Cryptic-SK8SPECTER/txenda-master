import React from 'react';

interface SkeletonGridProps {
  count?: number;      // Quantos itens mostrar
  className?: string;  // Classes extras para o container (grid)
  itemClass?: string;  // Classes para cada item individual
}

const SkeletonGrid = ({ 
  count = 8, 
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  itemClass = "aspect-[4/5] rounded-xl bg-muted animate-pulse"
}: SkeletonGridProps) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={itemClass} />
      ))}
    </div>
  );
};

export default SkeletonGrid;