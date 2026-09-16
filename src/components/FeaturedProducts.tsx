import React, { useState } from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface FeaturedProductsProps {
  activeCategory: string;
  currentCurrency: Currency;
  wishlistIds: string[];
  onSelectCategory: (category: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, selectedImage?: string) => void;
  onToggleWishlist: (product: Product) => void;
}

type TabFilter = 'all' | 'new' | 'bestsellers' | 'limited' | 'crossbody' | 'backpacks' | 'travel';

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  activeCategory,
  currentCurrency,
  wishlistIds,
  onSelectCategory,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const { products, categories } = useStore();

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product, product.images.main);
    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1500);
  };

  // Filter logic
  const filteredProducts = products.filter((product) => {
    if (activeCategory !== 'all') {
      return product.category === activeCategory;
    }
    if (activeTab === 'new') return product.isNew;
    if (activeTab === 'bestsellers') return product.isBestSeller;
    if (activeTab === 'limited') return product.isLimited;
    if (activeTab === 'crossbody') return product.category === 'crossbody';
    if (activeTab === 'backpacks') return product.category === 'backpacks';
    if (activeTab === 'travel') return product.category === 'travel';
    return true;
  });

  return (
    <section id="shop-section" className="bg-white py-20 lg:py-28 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 text-left">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              L&apos;atelier Zebra
            </p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-950">
              Notre collection des sacs
            </h2>
          </div>

          {/* Tab Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <div className="bg-zinc-100 p-1 rounded-full flex gap-1 border border-zinc-200">
              {[
                { id: 'all', label: 'Toutes les Pièces' },
                { id: 'bestsellers', label: 'Best-Sellers' },
                { id: 'new', label: 'Nouveautés' },
                { id: 'limited', label: 'Éditions Rares' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabFilter);
                    if (activeCategory !== 'all') onSelectCategory('all');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id && activeCategory === 'all'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills (Secondary filter) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 mb-8 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'border-black bg-black text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
            }`}
          >
            Toutes ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat.id).length;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-zinc-400 font-mono text-sm">
              Aucun modèle ne correspond à vos filtres.
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                onSelectCategory('all');
              }}
              className="px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors"
            >
              Réinitialiser les Filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlistIds.includes(product.id);
              const isAdded = addedAnimationId === product.id;
              const isHovered = hoveredProduct === product.id;
              const isOutOfStock = product.stockCount <= 0;
              const cardImage = isHovered ? product.images.hover || product.images.main : product.images.main;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="group relative bg-white rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between overflow-hidden text-left shadow-sm hover:shadow-lg hover:shadow-zinc-200/50"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
                    {/* Main vs Hover Image */}
                    <img
                      src={cardImage}
                      alt={`${product.name} – Zebra Bags Maroc`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Wishlist Heart Button on Top Right */}
                    <button
                      id={`btn-wishlist-${product.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(product);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer shadow-sm ${
                        isWishlisted
                          ? 'bg-black text-white scale-110 shadow-md'
                          : 'bg-white/80 text-zinc-700 hover:text-black hover:bg-white'
                      }`}
                      title={isWishlisted ? 'Retirer de la liste de souhaits' : 'Enregistrer dans la liste de souhaits'}
                      aria-label="Liste de souhaits"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>

                    {/* Quick Action Button — always visible on mobile */}
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
                          <>
                            Out Of Stock
                          </>
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

                    {/* Out of Stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[5] flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase rounded-full shadow-lg">
                          Out Of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Product Info */}
                  <div className="p-4 flex flex-col gap-2.5">
                    {/* Badges */}
                    {(product.isNew || product.isBestSeller || product.isLimited || isOutOfStock) && (
                      <div className="flex items-center gap-1.5">
                        {isOutOfStock && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[9px] font-semibold tracking-widest uppercase rounded-full">
                            Out Of Stock
                          </span>
                        )}
                        {!isOutOfStock && product.isNew && (
                          <span className="px-2 py-0.5 bg-zinc-900 text-white text-[9px] font-semibold tracking-widest uppercase rounded-full">
                            Nouveau
                          </span>
                        )}
                        {!isOutOfStock && product.isBestSeller && (
                          <span className="px-2 py-0.5 bg-white text-zinc-900 border border-zinc-300 text-[9px] font-semibold tracking-widest uppercase rounded-full">
                            Best Seller
                          </span>
                        )}
                        {!isOutOfStock && product.isLimited && (
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

                    {/* Price */}
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
    </section>
  );
};
