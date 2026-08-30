import React from 'react';
import { Sparkles } from 'lucide-react';

interface BentoFeaturesSectionProps {
  onExploreClick?: () => void;
}

export const BentoFeaturesSection: React.FC<BentoFeaturesSectionProps> = ({ onExploreClick }) => {
  return (
    <section id="features-section" className="py-24 bg-white text-zinc-900 border-b border-zinc-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500">
              Architecture & Excellence
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 mb-4">
            L'Excellence de l'Artisanat
          </h2>
          <div className="w-16 h-[2px] bg-amber-600 mb-4" />
          <p className="text-sm text-zinc-600 max-w-xl font-sans leading-relaxed">
            L'alliance parfaite entre l'artisanat toscan bicentenaire et l'ingénierie moderne de pointe.
          </p>
        </div>

        {/* Asymmetrical 4-Card Bento Grid matching reference layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Wide Top-Left (Col span 7) */}
          <div 
            id="bento-feature-1"
            className="lg:col-span-7 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            {/* Background Image with Light Gradient */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200" 
                alt="Cuir Vachetta Toscan" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300/50 px-3 py-1 rounded-full mb-3 font-medium">
                Point Fort de la Maison
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-amber-800 transition-colors">
                Cuir Vachetta Toscan Pleine Fleur
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-xl mb-4 font-sans">
                Issu de tanneries familiales à Santa Croce sull'Arno. Un tannage végétal lent aux écorces de chêne qui sublime le toucher et développe une patine d'exception.
              </p>
              <div className="w-12 h-[1px] bg-zinc-300 group-hover:w-20 group-hover:bg-amber-600 transition-all duration-300" />
            </div>
          </div>

          {/* Card 2: Narrow Top-Right (Col span 5) */}
          <div 
            id="bento-feature-2"
            className="lg:col-span-5 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            {/* Background Image with Light Gradient */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1200" 
                alt="Titane Aérospatial Grade 5" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-300/50 px-3 py-1 rounded-full mb-3 font-medium">
                Innovation Matière
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-emerald-800 transition-colors">
                Titane Aérospatial Ti-6Al-4V
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-4 font-sans">
                L'alliage des turbines de réacteurs appliqué à notre bouclerie pour une légerté et une résistance absolues.
              </p>
              <div className="w-12 h-[1px] bg-zinc-300 group-hover:w-20 group-hover:bg-emerald-600 transition-all duration-300" />
            </div>
          </div>

          {/* Card 3: Narrow Bottom-Left (Col span 5) */}
          <div 
            id="bento-feature-3"
            className="lg:col-span-5 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            {/* Background Image with Light Gradient */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1200" 
                alt="Soufflets Zébrés" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-amber-700 bg-amber-100 border border-amber-300/50 px-3 py-1 rounded-full mb-3 font-medium">
                Signature Zébrée
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-amber-800 transition-colors">
                Soufflets & Motifs Zébrés
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed mb-4 font-sans">
                L'empreinte graphique signature de la maison, mariant le noir obsidienne et l'ivoire dans un contraste saisissant.
              </p>
              <div className="w-12 h-[1px] bg-zinc-300 group-hover:w-20 group-hover:bg-amber-600 transition-all duration-300" />
            </div>
          </div>

          {/* Card 4: Wide Bottom-Right (Col span 7) */}
          <div 
            id="bento-feature-4"
            className="lg:col-span-7 group relative rounded-md overflow-hidden bg-zinc-50 border border-zinc-200 hover:border-zinc-300 transition-all duration-500 min-h-[380px] sm:min-h-[420px] flex flex-col justify-end p-8 sm:p-10"
          >
            {/* Background Image with Light Gradient */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=1200" 
                alt="Garantie Générationnelle" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-700 bg-emerald-100 border border-emerald-300/50 px-3 py-1 rounded-full mb-3 font-medium">
                Engagement à Vie
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-900 mb-2 group-hover:text-emerald-800 transition-colors">
                Garantie à Vie & Service d'Archive
              </h3>
              <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-xl mb-4 font-sans">
                Chaque pièce est accompagnée d'un certificat d'authenticité numéroté et bénéficie d'une prise en charge perpétuelle dans nos ateliers florentins.
              </p>
              <div className="w-12 h-[1px] bg-zinc-300 group-hover:w-20 group-hover:bg-emerald-600 transition-all duration-300" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
