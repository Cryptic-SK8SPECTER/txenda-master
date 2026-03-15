import React from 'react';

interface SkeletonGridProps {
  count?: number;      // Quantos itens mostrar
  className?: string;  // Classes extras para o container (grid)
  itemClass?: string;  // Classes para cada item individual
}

const SkeletonGrid = ({
  count = 8,
  itemClass = "aspect-[4/5] rounded-xl bg-muted animate-pulse",
}: SkeletonGridProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={itemClass} />
      ))}
    </>
  );
};

export default SkeletonGrid;