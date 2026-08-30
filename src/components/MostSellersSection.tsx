import React, { useState } from 'react';
import { Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface MostSellersSectionProps {
  currentCurrency: Currency;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, colorIndex?: number) => void;
  onToggleWishlist: (product: Product) => void;
}

export const MostSellersSection: React.FC<MostSellersSectionProps> = ({
  currentCurrency,
  wishlistIds,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}) => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const { products } = useStore();

  // Filter bestsellers and take exactly 3
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 3);

  return (
    <section id="most-sellers-section" className="py-24 lg:py-32 bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900">
            Collection des <span className="text-amber-600">Meilleures Ventes</span>
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base font-light tracking-wide">
            Nos silhouettes les plus acclamées, choisies inlassablement par les créateurs et connaisseurs internationaux.
          </p>
        </div>

        {/* 3-Column Clean Layout (Picture -> Name -> Price) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {bestSellers.map((product) => {
            const isHovered = hoveredProduct === product.id;

            return (
              <div
                key={product.id}
                id={`bestseller-item-${product.id}`}
                className="group flex flex-col text-left cursor-pointer"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                onClick={() => onQuickView(product)}
              >
                {/* Picture Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden mb-4">
                  <img
                    src={isHovered ? product.images.hover : product.images.main}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Name */}
                <h3 className="font-display font-bold text-base sm:text-lg text-zinc-900 tracking-wide group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mt-1 text-sm font-mono font-medium text-zinc-700">
                  {formatPrice(product.price, currentCurrency)}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
