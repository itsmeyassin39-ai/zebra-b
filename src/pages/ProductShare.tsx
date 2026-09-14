import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  Star,
  ShoppingBag,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { useStore } from '../store/StoreContext';

interface ProductShareProps {
  productId: string;
  onClose: () => void;
  cartCount: number;
  onAddToCart: (
    product: Product,
    colorIdx: number,
    hardware: string,
    monogram: string | undefined,
    quantity: number
  ) => void;
  onOpenCart: () => void;
}

const ProductShare: React.FC<ProductShareProps> = ({ productId, onClose, cartCount, onAddToCart, onOpenCart }) => {
  const { products, loading } = useStore();
  const product = products.find((p) => p.id === productId);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [bagPulse, setBagPulse] = useState(0);
  const prevCount = useRef(0);

  // Re-trigger the bag icon pop animation every time an item is added.
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBagPulse((k) => k + 1);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} – Zebra Bags`;
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111114] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#111114] text-white flex flex-col items-center justify-center gap-5 p-6 text-center">
        <p className="text-4xl">😕</p>
        <h1 className="font-display text-xl font-extrabold">Produit introuvable</h1>
        <p className="text-zinc-400 text-sm max-w-md">
          Ce produit n&apos;existe pas ou a été supprimé.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const colorsList = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : [];
  const selectedColor = colorsList[selectedColorIdx] || colorsList[0];
  const selectedColorPreview = selectedColor?.previewUrl?.trim();

  // When a specific color is selected and we have a photo for that variant,
  // it becomes the leading image so the customer sees the bag in that color.
  const imagesList = [
    ...(selectedColorPreview
      ? [{ key: `color-${selectedColorIdx}` as const, label: selectedColor.name || `Couleur ${selectedColorIdx + 1}`, url: selectedColorPreview }]
      : []),
    { key: 'main' as const, label: 'Vue de Face', url: product.images.main },
    ...(product.images.hover
      ? [{ key: 'hover' as const, label: 'Vue de Profil', url: product.images.hover }]
      : []),
    ...(product.images.detail
      ? [{ key: 'detail' as const, label: 'Détail', url: product.images.detail }]
      : []),
    ...(product.images.lifestyle
      ? [{ key: 'lifestyle' as const, label: 'En situation', url: product.images.lifestyle }]
      : []),
    ...(product.images.gallery ?? []).map((url, i) => ({
      key: `gallery-${i}` as const,
      label: `Photo ${i + 1}`,
      url,
    })),
  ];

  const handleAddToCart = () => {
    onAddToCart(
      product,
      selectedColorIdx,
      product.hardware || 'Argent brossé Palladium',
      undefined,
      quantity
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#111114] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#111114]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Retour à la boutique</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img src="/assets/imgs/Zebra logo (1).png" alt="Zebra Bags" className="h-7 w-7 object-contain" />
              <span className="font-display text-sm font-extrabold tracking-tight">Zebra Bags</span>
            </div>
            {cartCount > 0 && (
              <button
                id="btn-share-open-cart"
                onClick={onOpenCart}
                className="relative p-2 rounded-full border border-zinc-700 bg-zinc-900/70 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label={`Ouvrir le panier (${cartCount} article${cartCount > 1 ? 's' : ''})`}
                title="Voir mon panier"
              >
                <ShoppingBag className="w-5 h-5" />
                <span
                  key={bagPulse}
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold font-mono flex items-center justify-center animate-bag-pop"
                >
                  {cartCount}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-7">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
              <img
                src={imagesList[activeImageIdx]?.url ?? product.images.main}
                alt={`${product.name} – Zebra Bags`}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <button
                onClick={() => {
                  const prevIdx = activeImageIdx === 0 ? imagesList.length - 1 : activeImageIdx - 1;
                  setActiveImageIdx(prevIdx);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const nextIdx = (activeImageIdx + 1) % imagesList.length;
                  setActiveImageIdx(nextIdx);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className={`grid gap-3 mt-4 ${imagesList.length <= 2 ? 'grid-cols-2' : imagesList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {imagesList.map((img, i) => (
                <button
                  key={img.key}
                  onClick={() => setActiveImageIdx(i)}
                  className={`aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    activeImageIdx === i
                      ? 'border-white ring-2 ring-white/40 scale-[1.02]'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} – ${img.label}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {/* Category & Stock */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400">
                {product.categoryName}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-zinc-300">
                {product.stockCount > 0 ? `${product.stockCount} en stock` : 'Sur commande'}
              </span>
            </div>

            {/* Name & Price */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-sm text-zinc-400 mt-2">{product.tagline}</p>
              )}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-2xl font-bold text-white font-mono">
                  {formatPrice(product.price, 'DH')}
                </span>
                {product.originalPrice && product.originalPrice > 0 && (
                  <span className="text-base text-zinc-500 line-through font-mono">
                    {formatPrice(product.originalPrice, 'DH')}
                  </span>
                )}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {product.rating.toFixed(1)} ({product.reviewsCount} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Colors */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                  Couleur : <strong className="text-zinc-200 font-normal">{selectedColor?.name || 'Standard'}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedColorIdx(i);
                        setActiveImageIdx(0);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        selectedColorIdx === i
                          ? 'border-white bg-white/10 text-white shadow-xs'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-zinc-600"
                        style={{ backgroundColor: color.hex || '#111111' }}
                      />
                      {color.name || `Couleur ${i + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Matière
                </span>
                <span className="block text-xs text-zinc-200 mt-1 leading-snug">
                  {product.material || '—'}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Doublure
                </span>
                <span className="block text-xs text-zinc-200 mt-1 leading-snug">
                  {product.lining || '—'}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Dimensions
                </span>
                <span className="block text-xs text-zinc-200 mt-1">
                  {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                </span>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                  Quincaillerie
                </span>
                <span className="block text-xs text-zinc-200 mt-1 leading-snug">
                  {product.hardware || '—'}
                </span>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                  Caractéristiques
                </span>
                <ul className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-700 rounded-lg bg-zinc-950 px-2 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 text-zinc-400 hover:text-white text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2 text-zinc-400 hover:text-white text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 text-xs tracking-[0.2em] uppercase font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-black hover:bg-zinc-200 shadow-xl'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Ajouté !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Ajouter au Panier • {formatPrice(product.price * quantity, 'DH')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-zinc-300 shrink-0" /> Livraison offerte au Maroc
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-zinc-500">
            © 2026 Zebra Bags · Maroquinerie de luxe au Maroc
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductShare;
