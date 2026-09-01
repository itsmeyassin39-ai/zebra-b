import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, ChevronLeft } from 'lucide-react';
import { Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface CategoryPageProps {
  categoryId: string;
  currentCurrency: Currency;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, colorIndex?: number) => void;
  onToggleWishlist: (product: Product) => void;
  onHome: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categoryId,
  currentCurrency,
  wishlistIds,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  onHome,
}) => {
  const { products, categories } = useStore();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const category = categories.find((c) => c.id === categoryId);
  const categoryProducts = products.filter((p) => p.category === categoryId);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + Header */}
        <div className="mb-10">
          <button
            onClick={onHome}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>

          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-500">
              <span className="w-6 h-px bg-zinc-400" />
              <span>Catalogue Boutique</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 uppercase">
              {category?.name ?? 'Catégorie'}
            </h1>
            {category?.tagline && (
              <p className="text-sm text-zinc-600 max-w-xl font-light">
                {category.tagline}
              </p>
            )}
            <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
              {categoryProducts.length} {categoryProducts.length > 1 ? 'pièces' : 'pièce'}
            </p>
          </div>
        </div>

        {/* Product Grid */}
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider mb-4">
              Aucune création trouvée dans cette catégorie.
            </p>
            <button
              onClick={onHome}
              className="px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categoryProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const isAdded = addedAnimationId === product.id;
              const isHovered = hoveredProduct === product.id;
              const isOutOfStock = product.stockCount <= 0;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="group relative bg-white rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between overflow-hidden text-left shadow-sm hover:shadow-lg hover:shadow-zinc-200/50"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Top Image Container */}
                  <div
                    className="relative aspect-square w-full bg-zinc-100 overflow-hidden cursor-pointer"
                    onClick={() => onQuickView(product)}
                  >
                    <img
                      src={isHovered ? product.images.hover : product.images.main}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer shadow-sm ${
                        isWishlisted
                          ? 'bg-black text-white scale-110 shadow-md'
                          : 'bg-white/80 text-zinc-700 hover:text-black hover:bg-white'
                      }`}
                      aria-label="Liste de souhaits"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>

                    {/* Quick Add */}
                    <div className="absolute inset-x-3 bottom-3 z-10 lg:opacity-0 lg:group-hover:opacity-100 lg:transform lg:translate-y-2 lg:group-hover:translate-y-0 transition-all duration-200">
                      <button
                        disabled={isOutOfStock}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`w-full py-3 text-[11px] tracking-widest font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg ${
                          isOutOfStock
                            ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                            : isAdded
                              ? 'bg-emerald-600 text-white cursor-pointer'
                              : 'bg-white/95 text-zinc-900 hover:bg-black hover:text-white cursor-pointer'
                        }`}
                      >
                        {isOutOfStock ? (
                          <>Out Of Stock</>
                        ) : isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Ajouté !
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            Ajouter au Panier
                          </>
                        )}
                      </button>
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[5] flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full shadow-lg">
                          Out Of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom */}
                  <div className="p-4 flex flex-col gap-2.5">
                    {(product.isNew || product.isBestSeller || product.isLimited) && (
                      <div className="flex items-center gap-1.5">
                        {product.isNew && (
                          <span className="px-2 py-0.5 bg-zinc-900 text-white text-[9px] font-semibold tracking-widest uppercase rounded-full">
                            Nouveau
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="px-2 py-0.5 bg-white text-zinc-900 border border-zinc-300 text-[9px] font-semibold tracking-widest uppercase rounded-full">
                            Best Seller
                          </span>
                        )}
                        {product.isLimited && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-semibold tracking-widest uppercase rounded-full">
                            {product.stockCount} restants
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400">
                        {product.categoryName}
                      </span>
                      <h3
                        onClick={() => onQuickView(product)}
                        className="mt-1 font-display font-bold text-base text-zinc-900 leading-snug hover:text-amber-700 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                      {product.originalPrice && (
                        <span className="text-xs text-zinc-400 line-through font-mono">
                          {formatPrice(product.originalPrice, currentCurrency)}
                        </span>
                      )}
                      <span className="text-sm font-bold text-zinc-900 font-mono">
                        {formatPrice(product.price, currentCurrency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};