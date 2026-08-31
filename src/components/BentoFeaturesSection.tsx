import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BentoFeaturesSectionProps {
  onExploreClick?: () => void;
}

const FEATURED_PRODUCTS = [
  {
    id: 'zebra-savanna-tote',
    badge: 'Meilleure Vente',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300/50',
    hoverClass: 'group-hover:text-amber-800',
    underlineClass: 'group-hover:bg-amber-600',
    title: 'Sac à Dos Vintage en Cuir Synthétique',
    description:
      "L'emblème de la maison. Design vintage intemporel, fermetures à boucles distinctives et grandes poches latérales. Compagnon idéal pour les cours, le travail et les voyages.",
    price: '299 DH',
    oldPrice: '450 DH',
    rating: '4.9',
    reviews: '128',
    image: '/assets/imgs/Bag 1.jpeg',
    hoverImage: '/assets/imgs/bag 1 hover.jpeg',
  },
  {
    id: 'zebra-equus-crossbody',
    badge: 'Nouveauté',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300/50',
    hoverClass: 'group-hover:text-emerald-800',
    underlineClass: 'group-hover:bg-emerald-600',
    title: 'Sac à Dos Élégant avec Cadenas Décoratif',
    description:
      'Sublimez votre quotidien avec ce design chic et sophistiqué, inspiré des lignes de la maroquinerie de luxe. Fermeture à sangle avec cadenas métallique et clochette assortie.',
    price: '269 DH',
    rating: '4.9',
    reviews: '84',
    image: '/assets/imgs/Bag TD 1.jpeg',
    hoverImage: '/assets/imgs/Bog TD.jpeg',
  },
  {
    id: 'zebra-safari-weekender',
    badge: 'Édition Limitée',
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-300/50',
    hoverClass: 'group-hover:text-amber-800',
    underlineClass: 'group-hover:bg-amber-600',
    title: 'Sac Bandoulière Texturé avec Poche Zippée',
    description:
      'Une pièce audacieuse au fermoir tourniquet emblématique et finitions soignées. Format compact idéal pour transporter vos essentiels avec aisance.',
    price: '249 DH',
    rating: '5.0',
    reviews: '96',
    image: '/assets/imgs/prada gray.jpeg',
    hoverImage: '/assets/imgs/prada hover.jpeg',
  },
  {
    id: 'zebra-nocturne-clutch',
    badge: 'Nouveauté',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-300/50',
    hoverClass: 'group-hover:text-emerald-800',
    underlineClass: 'group-hover:bg-emerald-600',
    title: 'Pochette de Poignet Texturée avec Dragonne',
    description:
      "L'accessoire parfait pour vos soirées. Élégance et praticité, finition soignée et dragonne confortable pour un porté sécurisé. Fermeture zippée robuste.",
    price: '249 DH',
    rating: '4.9',
    reviews: '45',
    image: '/assets/imgs/lacosteBlack.jpeg',
    hoverImage: '/assets/imgs/lacoste hover.jpeg',
  },
];

export const BentoFeaturesSection: React.FC<BentoFeaturesSectionProps> = ({ onExploreClick }) => {
  return (
    <section id="features-section" className="py-24 bg-white text-zinc-900 border-b border-zinc-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500">
              Nos Pièces Signature
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 mb-4">
            Nos Coups de Cœur
          </h2>
          <div className="w-16 h-[2px] bg-amber-600 mb-4" />
          <p className="text-sm text-zinc-600 max-w-xl font-sans leading-relaxed">
            Les pièces les plus convoitées de la saison, sélectionnées pour leur allure et leur savoir-faire.
          </p>
        </div>

        {/* Asymmetrical 4-Card Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Wide Top-Left (Col span 7) */}
          <div 
            id="bento-feature-1"
            className="lg:col-span-7 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            {/* Background Image with Light Gradient */}
            <div className="absolute inset-0 z-0">
              <img 
                src={FEATURED_PRODUCTS[0].image} 
                alt={FEATURED_PRODUCTS[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-3 font-medium border ${FEATURED_PRODUCTS[0].badgeClass}`}>
                {FEATURED_PRODUCTS[0].badge}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-zinc-900">★ {FEATURED_PRODUCTS[0].rating}</span>
                <span className="text-xs text-zinc-500">({FEATURED_PRODUCTS[0].reviews} avis)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-amber-800 transition-colors">
                {FEATURED_PRODUCTS[0].title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-xl mb-3 font-sans">
                {FEATURED_PRODUCTS[0].description}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-bold text-zinc-900">{FEATURED_PRODUCTS[0].price}</span>
                {FEATURED_PRODUCTS[0].oldPrice && (
                  <span className="text-sm text-zinc-400 line-through">{FEATURED_PRODUCTS[0].oldPrice}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 mb-3 border-t border-zinc-200 pt-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Prix Total</span>
                <span className="text-lg font-bold text-zinc-900">{FEATURED_PRODUCTS[0].price}</span>
              </div>
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-amber-700 transition-colors"
              >
                Découvrir
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Narrow Top-Right (Col span 5) */}
          <div 
            id="bento-feature-2"
            className="lg:col-span-5 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={FEATURED_PRODUCTS[1].image} 
                alt={FEATURED_PRODUCTS[1].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-3 font-medium border ${FEATURED_PRODUCTS[1].badgeClass}`}>
                {FEATURED_PRODUCTS[1].badge}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-zinc-900">★ {FEATURED_PRODUCTS[1].rating}</span>
                <span className="text-xs text-zinc-500">({FEATURED_PRODUCTS[1].reviews} avis)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-emerald-800 transition-colors">
                {FEATURED_PRODUCTS[1].title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-3 font-sans">
                {FEATURED_PRODUCTS[1].description}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-bold text-zinc-900">{FEATURED_PRODUCTS[1].price}</span>
              </div>
              <div className="flex items-center justify-between gap-3 mb-3 border-t border-zinc-200 pt-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Prix Total</span>
                <span className="text-lg font-bold text-zinc-900">{FEATURED_PRODUCTS[1].price}</span>
              </div>
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-emerald-700 transition-colors"
              >
                Découvrir
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3: Narrow Bottom-Left (Col span 5) */}
          <div 
            id="bento-feature-3"
            className="lg:col-span-5 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={FEATURED_PRODUCTS[2].image} 
                alt={FEATURED_PRODUCTS[2].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-3 font-medium border ${FEATURED_PRODUCTS[2].badgeClass}`}>
                {FEATURED_PRODUCTS[2].badge}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-zinc-900">★ {FEATURED_PRODUCTS[2].rating}</span>
                <span className="text-xs text-zinc-500">({FEATURED_PRODUCTS[2].reviews} avis)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-amber-800 transition-colors">
                {FEATURED_PRODUCTS[2].title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-3 font-sans">
                {FEATURED_PRODUCTS[2].description}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-bold text-zinc-900">{FEATURED_PRODUCTS[2].price}</span>
              </div>
              <div className="flex items-center justify-between gap-3 mb-3 border-t border-zinc-200 pt-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Prix Total</span>
                <span className="text-lg font-bold text-zinc-900">{FEATURED_PRODUCTS[2].price}</span>
              </div>
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-amber-700 transition-colors"
              >
                Découvrir
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 4: Wide Bottom-Right (Col span 7) */}
          <div 
            id="bento-feature-4"
            className="lg:col-span-7 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={FEATURED_PRODUCTS[3].image} 
                alt={FEATURED_PRODUCTS[3].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <span className={`inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-3 font-medium border ${FEATURED_PRODUCTS[3].badgeClass}`}>
                {FEATURED_PRODUCTS[3].badge}
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-zinc-900">★ {FEATURED_PRODUCTS[3].rating}</span>
                <span className="text-xs text-zinc-500">({FEATURED_PRODUCTS[3].reviews} avis)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-emerald-800 transition-colors">
                {FEATURED_PRODUCTS[3].title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-xl mb-3 font-sans">
                {FEATURED_PRODUCTS[3].description}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-bold text-zinc-900">{FEATURED_PRODUCTS[3].price}</span>
              </div>
              <div className="flex items-center justify-between gap-3 mb-3 border-t border-zinc-200 pt-2">
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">Prix Total</span>
                <span className="text-lg font-bold text-zinc-900">{FEATURED_PRODUCTS[3].price}</span>
              </div>
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-emerald-700 transition-colors"
              >
                Découvrir
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
