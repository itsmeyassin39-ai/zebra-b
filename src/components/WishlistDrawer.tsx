import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/formatters';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistProducts: Product[];
  currentCurrency: Currency;
  onClose: () => void;
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistProducts,
  currentCurrency,
  onClose,
  onRemoveFromWishlist,
  onMoveToCart,
  onQuickView,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="wishlist-drawer-panel"
          className="w-screen max-w-md bg-[#111114] border-l border-zinc-800 shadow-2xl flex flex-col justify-between text-white animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-white fill-white" />
              <h3 className="font-display tracking-[0.2em] text-base font-bold uppercase">
                Liste de Souhaits ({wishlistProducts.length})
              </h3>
            </div>
            <button
              id="btn-close-wishlist"
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Fermer la liste de souhaits"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
            {wishlistProducts.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                  <Heart className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white tracking-wide">
                    Votre liste de souhaits est actuellement vide
                  </h4>
                  <p className="text-xs text-zinc-400 font-light">
                    Enregistrez vos pièces préférées en cliquant sur l'icône cœur de n'importe quel produit.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-200 cursor-pointer"
                >
                  Explorer la Collection
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  id={`wishlist-item-${product.id}`}
                  className="flex gap-4 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 group"
                >
                  <img
                    src={product.images.main}
                    alt={`${product.name} – Zebra Bags Maroc`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-lg object-cover border border-zinc-800 shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onQuickView(product);
                    }}
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4
                          className="text-xs font-bold text-white tracking-wide hover:text-zinc-300 cursor-pointer line-clamp-1"
                          onClick={() => {
                            onClose();
                            onQuickView(product);
                          }}
                        >
                          {product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                          title="Retirer de la liste de souhaits"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {product.categoryName}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 mt-2">
                      <span className="text-xs font-bold text-white font-mono shrink-0">
                        {formatPrice(product.price, currentCurrency)}
                      </span>

                      <button
                        onClick={() => {
                          onMoveToCart(product);
                          onRemoveFromWishlist(product.id);
                        }}
                        className="px-2.5 sm:px-3 py-1.5 bg-white text-black hover:bg-zinc-200 text-[10px] tracking-wider uppercase font-bold rounded flex items-center gap-1 cursor-pointer whitespace-nowrap min-w-0"
                      >
                        <ShoppingBag className="w-3 h-3 shrink-0" />
                        <span className="truncate">Déplacer au Panier</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlistProducts.length > 0 && (
            <div className="p-6 bg-zinc-950 border-t border-zinc-800">
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs tracking-widest uppercase font-bold rounded-lg border border-zinc-700 transition-colors cursor-pointer"
              >
                Continuer à Parcourir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
