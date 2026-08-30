import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check, Sparkles, Filter } from 'lucide-react';
import { Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface FeaturedProductsProps {
  activeCategory: string;
  currentCurrency: Currency;
  wishlistIds: string[];
  onSelectCategory: (category: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, colorIndex?: number) => void;
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
    onAddToCart(product);
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
            <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-500">
              <span className="w-6 h-px bg-zinc-400" />
              <span>Catalogue Boutique</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 uppercase">
              Créations Vedettes
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl font-light">
              Explorez nos chefs-d'œuvre de maroquinerie monochrome, d'ingénierie de bouclerie et de design sculptural.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-zinc-100 p-1.5 rounded-full border border-zinc-200 text-xs">
            {[
              { id: 'all', label: 'Toutes les Pièces' },
              { id: 'new', label: 'Nouvelle Saison' },
              { id: 'bestsellers', label: 'Meilleures Ventes' },
              { id: 'limited', label: 'Édition Limitée' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabFilter);
                  if (activeCategory !== 'all') onSelectCategory('all');
                }}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
                  activeTab === tab.id && activeCategory === 'all'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer font-medium border ${
              activeCategory === 'all'
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white text-zinc-600 border-zinc-200 hover:text-black hover:border-zinc-400'
            }`}
          >
            Tous les Types
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setActiveTab('all');
              }}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer font-medium border ${
                activeCategory === cat.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:text-black hover:border-zinc-400'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wider mb-2">Aucune création trouvée dans cette catégorie.</p>
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

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="group relative bg-zinc-50 rounded-xl border border-zinc-200 hover:border-zinc-400 transition-all duration-300 flex flex-col justify-between overflow-hidden text-left shadow-sm hover:shadow-md"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
                    {/* Main vs Hover Image */}
                    <img
                      src={isHovered ? product.images.hover : product.images.main}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Badges on Top Left */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {product.isNew && (
                        <span className="px-2.5 py-0.5 bg-black text-white text-[9px] font-bold tracking-widest uppercase rounded shadow-sm">
                          Nouvelle Saison
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="px-2.5 py-0.5 bg-white/95 text-zinc-900 border border-zinc-300 text-[9px] font-semibold tracking-widest uppercase rounded shadow-sm">
                          Meilleure Vente
                        </span>
                      )}
                      {product.isLimited && (
                        <span className="px-2.5 py-0.5 bg-zinc-900 text-zinc-100 text-[9px] font-mono tracking-widest uppercase rounded shadow-sm">
                          {product.stockCount} Restants
                        </span>
                      )}
                    </div>

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

                    {/* Hover Quick Action Buttons */}
                    <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10">
                      <button
                        id={`btn-quick-view-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="flex-1 py-2.5 bg-white/95 hover:bg-white text-zinc-900 text-[10px] tracking-widest font-bold uppercase rounded-lg border border-zinc-300 backdrop-blur-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Aperçu Rapide
                      </button>

                      <button
                        id={`btn-quick-add-${product.id}`}
                        onClick={(e) => handleQuickAdd(e, product)}
                        className={`flex-1 py-2.5 text-[10px] tracking-widest font-bold uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-black text-white hover:bg-zinc-800'
                        }`}
                      >
                        {isAdded ? (
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
                  </div>

                  {/* Card Bottom: Product Info */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
                    <div>
                      {/* Category and Rating */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono mb-1.5">
                        <span className="uppercase tracking-wider font-medium">{product.categoryName}</span>
                        <div className="flex items-center gap-1 text-zinc-700 font-medium">
                          <span>★</span>
                          <span>{product.rating}</span>
                          <span className="text-zinc-400">({product.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3
                        onClick={() => onQuickView(product)}
                        className="font-bold text-sm sm:text-base text-zinc-900 tracking-wide hover:text-amber-700 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>

                      {/* Tagline / Subtitle */}
                      <p className="text-xs text-zinc-600 font-light line-clamp-1 mt-0.5">
                        {product.tagline}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="pt-2 border-t border-zinc-200 flex items-center gap-1.5">
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
