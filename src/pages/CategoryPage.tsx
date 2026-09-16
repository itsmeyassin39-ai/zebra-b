import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Check, ChevronLeft } from 'lucide-react';
import { Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface CategoryPageProps {
  categoryId: string;
  currentCurrency: Currency;
  wishlistIds: string[];
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, selectedImage?: string) => void;
  onToggleWishlist: (product: Product) => void;
  onHome: () => void;
}

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  backpacks: {
    title: 'Sacs à Dos au Maroc | Zebra Bags – Livraison Gratuite',
    description: 'Découvrez nos sacs à dos tendance et élégants au Maroc. Sacs à dos cuir, scolaire et urbain. Livraison gratuite partout au Maroc et paiement à la livraison.',
  },
  travel: {
    title: 'Sacs de Voyage au Maroc | Zebra Bags – Livraison Gratuite',
    description: 'Sac de voyage cabine et weekend bag au Maroc. Sacs de voyage spacieux et élégants avec livraison gratuite. Paiement à la livraison.',
  },
  crossbody: {
    title: 'Sacs Bandoulière au Maroc | Zebra Bags – Livraison Gratuite',
    description: 'Sacs bandoulière tendance au Maroc en cuir synthétique et grainé. Modèles élégants avec livraison gratuite et paiement à la livraison.',
  },
  clutches: {
    title: 'Pochettes & Mini Sacs au Maroc | Zebra Bags',
    description: 'Pochettes de soirée, mini sacs et clutches élégants au Maroc. Livraison gratuite et paiement à la livraison.',
  },
  accessories: {
    title: 'Accessoires & Maroquinerie au Maroc | Zebra Bags',
    description: 'Accessoires de maroquinerie : ceintures, porte-cartes et plus au Maroc. Livraison gratuite et paiement à la livraison.',
  },
};

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

  useEffect(() => {
    const seo = CATEGORY_SEO[categoryId];
    if (seo) {
      document.title = seo.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', `${seo.description} Sacs et maroquinerie Zebra Bags.`);
    }
    return () => {
      document.title = 'Zebra Bags | Sacs & Maroquinerie de Luxe au Maroc – Livraison Gratuite';
    };
  }, [categoryId]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onAddToCart(product, product.images.main);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Category Hero Banner */}
      <section className="relative bg-[#111114] text-white py-16 sm:py-24 overflow-hidden border-b border-zinc-800">
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: category ? `url(${category.image})` : undefined }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 font-mono uppercase tracking-widest mb-6">
            <button onClick={onHome} className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              Accueil
            </button>
            <span>/</span>
            <span className="text-white">{category?.name || 'Catégorie'}</span>
          </nav>

          <div className="max-w-2xl">
            {category?.badge && (
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-200 mb-4">
                {category.badge}
              </span>
            )}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
              {category?.name}
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
              {category?.tagline}
            </p>
            <p className="text-xs font-mono text-zinc-400 mt-4">
              {categoryProducts.length} modèle{categoryProducts.length > 1 ? 's' : ''} disponible{categoryProducts.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <div className="border-b border-zinc-200 bg-zinc-50 sticky top-16 z-20 backdrop-blur-md bg-zinc-50/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 overflow-x-auto scrollbar-none flex items-center gap-2">
          {categories.map((c) => {
            const isCurrent = c.id === categoryId;
            const count = products.filter((p) => p.category === c.id).length;
            return (
              <a
                key={c.id}
                href={`#category/${c.id}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200'
                }`}
              >
                {c.name} ({count})
              </a>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {categoryProducts.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="text-zinc-500 font-mono text-sm">
              Aucun produit disponible dans cette catégorie pour le moment.
            </p>
            <button
              onClick={onHome}
              className="px-6 py-2.5 bg-black text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Retour aux Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categoryProducts.map((product) => {
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
                  <div
                    className="relative aspect-square w-full bg-zinc-100 overflow-hidden cursor-pointer"
                    onClick={() => onQuickView(product)}
                  >
                    <img
                      src={cardImage}
                      alt={`${product.name} – Zebra Bags Maroc`}
                      loading="lazy"
                      decoding="async"
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
