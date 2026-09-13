import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
} from 'lucide-react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/formatters';
import { useStore } from '../store/StoreContext';

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
  const { customerReviews } = useStore();

  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedHardware, setSelectedHardware] = useState(product.hardware.split(' or ')[0] || 'Argent brossé Palladium');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

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
    { key: 'hover' as const, label: 'Vue de Profil', url: product.images.hover },
    ...(product.images.detail
      ? [{ key: 'detail' as const, label: 'Détail Zébré', url: product.images.detail }]
      : []),
    ...(product.images.lifestyle
      ? [{ key: 'lifestyle' as const, label: 'Modèle Éditorial', url: product.images.lifestyle }]
      : []),
    ...(product.images.gallery ?? []).map((url, i) => ({
      key: `gallery-${i}` as const,
      label: `Photo ${i + 1}`,
      url,
    })),
  ];

  const handleAdd = () => {
    onAddToCart(product, selectedColorIdx, selectedHardware, undefined, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const productReviews = customerReviews.filter((review) => review.productId === product.id);
  const averageRating = productReviews.length
    ? productReviews.reduce((total, review) => total + review.rating, 0) / productReviews.length
    : null;
  const featuredReview = productReviews[0];

  useEffect(() => {
    if (!product) return;
    const schemaId = 'product-schema';
    const existing = document.getElementById(schemaId);
    if (existing) existing.remove();
    const imageUrl = product.images.main.startsWith('http')
      ? product.images.main
      : `https://zebrabags.shop${product.images.main.replace(/\s/g, '%20')}`;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = schemaId;
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${product.name} – Zebra Bags`,
      description: product.tagline,
      image: imageUrl,
      brand: { '@type': 'Brand', name: 'Zebra Bags' },
      sku: product.id,
      offers: {
        '@type': 'Offer',
        url: `https://zebrabags.shop/#product/${product.id}`,
        priceCurrency: 'MAD',
        price: product.price,
        availability: product.stockCount > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'Zebra Bags' },
        areaServed: { '@type': 'Country', name: 'Maroc' },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewsCount,
      },
    });
    document.head.appendChild(script);
    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, [product]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div
          id="quick-view-modal-card"
          className="relative z-10 max-w-5xl w-full bg-[#111114] border border-zinc-700/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200"
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
          <div className="lg:col-span-7 p-6 sm:p-8 bg-zinc-950/90 lg:border-r border-zinc-800">
            {/* Big Active Image */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
              <img
                src={imagesList[activeImageIdx]?.url ?? product.images.main}
                alt={`${product.name} – Zebra Bags Maroc`}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Zebra Texture Watermark */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-zebra-subtle opacity-30 pointer-events-none" />

              {/* Image Navigation Arrows */}
              <button
                onClick={() => {
                  const prevIdx = activeImageIdx === 0 ? imagesList.length - 1 : activeImageIdx - 1;
                  setActiveImageIdx(prevIdx);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const nextIdx = (activeImageIdx + 1) % imagesList.length;
                  setActiveImageIdx(nextIdx);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Selectors */}
            <div className={`grid gap-3 mt-4 ${imagesList.length === 2 ? 'grid-cols-2' : imagesList.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {imagesList.map((img, i) => (
                <button
                  key={img.key}
                  onClick={() => setActiveImageIdx(i)}
                  className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeImageIdx === i
                      ? 'border-white ring-2 ring-white/40 scale-102'
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

          {/* Right Column: Product Customizer & Details (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col text-left space-y-6">
            
            <div className="space-y-5">
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
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xl font-bold text-white font-mono">
                    {formatPrice(product.price, currentCurrency)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-zinc-500 line-through font-mono">
                      {formatPrice(product.originalPrice, currentCurrency)}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400 font-mono">
                    ★ {averageRating !== null ? averageRating.toFixed(1) : '—'} ({productReviews.length} avis)
                  </span>
                </div>
              </div>

              {/* Colors */}
              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="pt-1">
                  <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-500 block mb-2">
                    Couleur : <strong className="text-zinc-200 font-normal">{selectedColor?.name || 'Standard'}</strong>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, i) => (
                      <button
                        key={`${color.name || 'color'}-${i}`}
                        onClick={() => {
                          setSelectedColorIdx(i);
                          setActiveImageIdx(0);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                          selectedColorIdx === i
                            ? 'border-white bg-white/10 text-white shadow-xs'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-zinc-600 shrink-0"
                          style={{ backgroundColor: color.hex || '#111111' }}
                        />
                        <span className="max-w-[180px] truncate text-left">{color.name || `Couleur ${i + 1}`}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials & Craft specs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">Matière</span>
                  <span className="block text-xs text-zinc-200 mt-1 leading-snug">{product.material}</span>
                </div>
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">Doublure</span>
                  <span className="block text-xs text-zinc-200 mt-1 leading-snug">{product.lining}</span>
                </div>
                <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-3">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-zinc-500">Dimensions</span>
                  <span className="block text-xs text-zinc-200 mt-1">
                    {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                  </span>
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
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-zinc-300 shrink-0" /> Livraison Express offerte au Maroc
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-zinc-300 shrink-0" /> Garantie à Vie
                </span>
              </div>

              {/* Written reviews have been retired; customer screenshots are shown in the gallery instead.
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-400">
                      Avis clients
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5" aria-label={`Note moyenne : ${averageRating.toFixed(1)} sur 5`}>
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            className={`w-3 h-3 ${
                              index < Math.round(averageRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {averageRating.toFixed(1)} ({productReviews.length})
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-100 line-clamp-1">{featuredReview.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-400 line-clamp-2">
                      {featuredReview.comment}
                    </p>
                    <p className="mt-1.5 text-[10px] font-mono text-zinc-500">— {featuredReview.author}</p>
                  </div>
                </div>
              */}
            </div>

          </div>

        </div>
        </div>
      </div>
    </div>
  );
};
