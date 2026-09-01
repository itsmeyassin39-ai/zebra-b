import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Sparkles, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Currency } from '../types';
import { PRODUCTS } from '../data/products';
import { formatPrice } from '../utils/formatters';

interface HeroProps {
  currentCurrency: Currency;
  onShopClick: () => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const HERO_SLIDES = [
  {
    productIndex: 0, // The Savanna Monolith Tote
    badge: 'COLLECTION 2026 • SIGNATURE',
    subheadline:
      'Là où la précision architecturale italienne rencontre l\'élégance sauvage de la faune monochrome. Confectionné à la main en Toscane avec des soufflets à plis zébrés sur mesure.',
    highlightTag: 'Édition Limitée • Sérié',
  },
  {
    productIndex: 1, // The Equus Crossbody
    badge: 'NOUVELLE ARRIVÉE • CAPSULE NOIR',
    subheadline:
      'Une silhouette de boîte sculpturale incrustée de poil de veau zébré organique et tactile, dotée d\'une mécanique de fermoir à tour à finition titane.',
    highlightTag: 'Poil de Veau Tactile',
  },
  {
    productIndex: 3, // The Serengeti Grand Weekender
    badge: 'VOYAGE & ÉVASION • 55CM',
    subheadline:
      'Le sublime sac de voyage 55 cm de luxe en toile cirée épaisse et cuir vachetta pleine fleur, couronné d\'un tissage zébré.',
    highlightTag: 'Approuvé Bagage Cabine IATA',
  },
];

export const Hero: React.FC<HeroProps> = ({
  currentCurrency,
  onShopClick,
  onAddToCart,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const slide = HERO_SLIDES[activeSlide];
  const activeProduct = PRODUCTS[slide.productIndex] || PRODUCTS[0];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950"
      style={{
        backgroundImage: "url('https://i.postimg.cc/YCtgK6CY/bggg-png-2K-202608290045.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Top spacing container to cleanly separate navbar from hero content */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start pt-28 sm:pt-40 md:pt-48 lg:pt-56 pb-16 lg:pb-28">

        {/* LEFT COLUMN: Typography & CTAs */}
        <motion.div
          className="lg:col-span-4 flex flex-col gap-8 lg:gap-10 relative z-10 pt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Headline with clear separation from navbar */}
          <motion.div variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[4.85rem] font-display font-bold text-white uppercase leading-[1.0] tracking-tight">
              Conçu<br />
              pour la Concentration.<br />
              <span className="text-white/40 font-serif font-normal italic">
                Pensé<br />
                pour la Vie.
              </span>
            </h1>
          </motion.div>

          {/* Details & Subheadlines rendered as clean editorial typography */}
          <motion.div variants={itemVariants} className="space-y-4 max-w-md">
            <div className="flex items-center gap-2.5 text-xs font-mono tracking-[0.25em] text-white/90 uppercase font-medium">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{slide.badge}</span>
            </div>

            <p className="text-white/75 text-sm sm:text-base leading-relaxed font-light">
              {slide.subheadline}
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-white/50 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span>{slide.highlightTag}</span>
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div variants={itemVariants}>
            <button
              onClick={onShopClick}
              className="inline-flex items-center gap-4 px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-full shadow-[0_8px_30px_rgba(255,255,255,0.1)] transition-all duration-300 cursor-pointer group w-max"
            >
              <span className="font-bold text-sm tracking-wide">Explorer l'Expérience</span>
              <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        </motion.div>

        {/* CENTER COLUMN: Empty Center — hidden below lg since the bag image was removed */}
        <div className="hidden lg:flex lg:col-span-4 justify-center items-center relative z-0 min-h-[400px]">
          {/* Bag image removed as requested */}
        </div>

        {/* RIGHT COLUMN: Interactive Cards */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:gap-8 justify-start lg:items-end relative z-10 pt-4">

          {/* Top Right: Mini Carousel Thumbnail Cards */}
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            {HERO_SLIDES.map((s, idx) => {
              if (idx === activeSlide) return null;
              const prod = PRODUCTS[s.productIndex];
              return (
                <motion.div
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 p-1 overflow-hidden">
                    <img src={prod.images.main} alt={prod.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-white truncate group-hover:text-white transition-colors">
                      {prod.name}
                    </span>
                    <span className="text-[11px] font-mono text-white/70">
                      {formatPrice(prod.price, currentCurrency)}
                    </span>
                    <span className="text-[10px] text-white/40 font-light truncate uppercase tracking-wider">
                      {prod.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Right: Main Product Details Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-[360px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-7 shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-[0.25em] text-white/50 uppercase block">
                  PIÈCE VEDETTE
                </span>
                <h3 className="text-xl font-bold text-white font-display tracking-tight">
                  {activeProduct.name}
                </h3>
              </div>
              <button
                onClick={() => onAddToCart(activeProduct)}
                className="w-10 h-10 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black text-white transition-all group shrink-0 ml-3"
                aria-label="Ajouter au Panier"
                title="Ajouter au Panier"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-white font-semibold">
                  {formatPrice(activeProduct.price, currentCurrency)}
                </span>
                <span className="text-xs font-mono text-white/60">
                  ★ {activeProduct.rating} ({activeProduct.reviewsCount} avis)
                </span>
              </div>

              {/* Real Craftsmanship & Material Meta */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div>
                  <span className="text-white/40 block tracking-widest uppercase">POIDS</span>
                  <span className="text-white/80 font-medium">{activeProduct.weight}</span>
                </div>
                <div>
                  <span className="text-white/40 block tracking-widest uppercase">MATIÈRE</span>
                  <span className="text-white/80 font-medium truncate block">{activeProduct.material}</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
