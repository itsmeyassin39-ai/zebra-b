import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/formatters';

interface QuickViewModalProps {
  product: Product | null;
  currentCurrency: Currency;
  isWishlisted: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product,
    selectedColorIdx: number,
    hardware: string,
    monogram?: string,
    quantity?: number
  ) => void;
  onToggleWishlist: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  currentCurrency,
  isWishlisted,
  onClose,
  onAddToCart,
  onToggleWishlist,
}) => {
  if (!product) return null;

  const [activeImageKey, setActiveImageKey] = useState<'main' | 'hover' | 'detail' | 'lifestyle'>('main');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedHardware, setSelectedHardware] = useState(product.hardware.split(' or ')[0] || 'Argent brossé Palladium');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const imagesList = [
    { key: 'main' as const, label: 'Vue de Face', url: product.images.main },
    { key: 'hover' as const, label: 'Vue de Profil', url: product.images.hover },
    ...(product.images.detail
      ? [{ key: 'detail' as const, label: 'Détail Zébré', url: product.images.detail }]
      : []),
    ...(product.images.lifestyle
      ? [{ key: 'lifestyle' as const, label: 'Modèle Éditorial', url: product.images.lifestyle }]
      : []),
  ];

  const handleAdd = () => {
    onAddToCart(product, selectedColorIdx, selectedHardware, undefined, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div
        id="quick-view-modal-card"
        className="relative z-10 max-w-5xl w-full bg-[#111114] border border-zinc-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          id="btn-close-quick-view"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black text-zinc-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Fermer la fenêtre"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-zinc-950/90 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
            {/* Big Active Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
              <img
                src={product.images[activeImageKey]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Zebra Texture Watermark */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-zebra-subtle opacity-30 pointer-events-none" />

              {/* Image Navigation Arrows */}
              <button
                onClick={() => {
                  const currIdx = imagesList.findIndex((i) => i.key === activeImageKey);
                  const prevIdx = currIdx === 0 ? imagesList.length - 1 : currIdx - 1;
                  setActiveImageKey(imagesList[prevIdx].key);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const currIdx = imagesList.findIndex((i) => i.key === activeImageKey);
                  const nextIdx = (currIdx + 1) % imagesList.length;
                  setActiveImageKey(imagesList[nextIdx].key);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            <div className={`grid gap-3 mt-4 ${imagesList.length === 2 ? 'grid-cols-2' : imagesList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {imagesList.map((img) => (
                <button
                  key={img.key}
                  onClick={() => setActiveImageKey(img.key)}
                  className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageKey === img.key
                      ? 'border-white ring-2 ring-white/40 scale-102'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Customizer & Details (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-left space-y-6 max-h-[85vh] overflow-y-auto">
            
            <div className="space-y-4">
              {/* Category & Serial Tag */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400">
                  {product.categoryName} • Florence, Italie
                </span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-zinc-300">
                  {product.stockCount > 0 ? `${product.stockCount} En Boutique` : 'Pré-commande'}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-wide">
                  {product.name}
                </h2>
                <p className="text-xs text-zinc-400 font-light mt-1">
                  {product.tagline}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl font-bold text-white font-mono">
                    {formatPrice(product.price, currentCurrency)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-zinc-500 line-through font-mono">
                      {formatPrice(product.originalPrice, currentCurrency)}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 font-mono">★ {product.rating} ({product.reviewsCount} avis)</span>
                </div>
              </div>

              </div>

            {/* Action Bottom Row: Quantity + Add to Bag + Wishlist */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-zinc-700 rounded-lg bg-zinc-950 px-2 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 text-zinc-400 hover:text-white text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2 text-zinc-400 hover:text-white text-sm"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag */}
                <button
                  id="btn-modal-add-to-bag"
                  onClick={handleAdd}
                  className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-black hover:bg-zinc-200 shadow-xl'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté au Panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Ajouter au Panier • {formatPrice(product.price * quantity, currentCurrency)}</span>
                    </>
                  )}
                </button>

                {/* Wishlist Heart */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    isWishlisted
                      ? 'bg-white text-black border-white'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white hover:border-zinc-500'
                  }`}
                  title={isWishlisted ? 'Enregistré dans la liste de souhaits' : 'Ajouter à la liste de souhaits'}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-black' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-zinc-300" /> Livraison Express offerte au Maroc
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-300" /> Garantie à Vie
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
