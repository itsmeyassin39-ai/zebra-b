import React, { useState } from 'react';
import { Compass, Sparkles, Feather, ShieldCheck, HeartHandshake } from 'lucide-react';

export const AboutBrand: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'philosophy' | 'craft' | 'wild'>('philosophy');

  return (
    <section id="about-section" className="py-20 lg:py-32 bg-white border-b border-zinc-200 text-zinc-900 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Storytelling Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative">
              {/* Primary Large Editorial Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-200 shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85"
                  alt="Zebra Bags Artisanat d'Exception"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center brightness-95 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                
                {/* Embedded Quote on Image */}
                <div className="absolute bottom-6 inset-x-6 p-4 rounded-xl bg-white/90 backdrop-blur-md border border-zinc-200 text-left shadow-lg">
                  <p className="font-serif italic text-sm sm:text-base text-zinc-900">
                    “Aucun zèbre ne porte exactement les mêmes rayures. En mode, le véritable luxe consiste à honorer le caractère unique et sauvage qui est en vous.”
                  </p>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase mt-2 block font-semibold">
                    — Aurelia Vane, Directrice Artistique
                  </span>
                </div>
              </div>

              {/* Floating Secondary Artisan Detail Card */}
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-52 aspect-square rounded-xl overflow-hidden border-2 border-white shadow-2xl bg-zinc-100">
                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=85"
                  alt="Couture Sellier Toscan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Manifesto */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.3em] uppercase text-zinc-500">
                <span className="w-6 h-px bg-zinc-400" />
                <span>Notre Héritage & Manifeste</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 uppercase">
                L'Art du Monolithe & de la Rayure
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
                Fondée à Florence avec un engagement sans compromis pour la pureté architecturale et les motifs organiques de la faune sauvage. ZEBRA marie le travail du cuir toscan intemporel à une bouclerie avancée de qualité aérospatiale.
              </p>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
              {[
                { id: 'philosophy', label: 'Philosophie' },
                { id: 'craft', label: 'Artisanat Toscan' },
                { id: 'wild', label: 'Éthique Sauvage' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-mono uppercase tracking-widest pb-2 transition-all cursor-pointer relative ${
                    activeTab === tab.id
                      ? 'text-zinc-900 font-bold'
                      : 'text-zinc-400 hover:text-zinc-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[140px]">
              {activeTab === 'philosophy' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="font-serif font-bold text-lg text-zinc-900">Rigueur Sculpturale & Asymétrie</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    Chaque sac est proportionné selon des ratios géométriques stricts inspirés de l'architecture brutaliste moderne et des motifs naturels de la savane. Nous rejetons la fast fashion pour créer des pièces d'héritage qui défient les décennies.
                  </p>
                </div>
              )}
              {activeTab === 'craft' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="font-serif font-bold text-lg text-zinc-900">Tanneries de Santa Croce sull'Arno</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    Nos cuirs subissent un tannage végétal de 40 jours à base d'extraits naturels d'écorce d'arbre. Des tranches brossées à la main et des coutures sellier garantissent une intégrité structurelle qui se renforce avec l'âge.
                  </p>
                </div>
              )}
              {activeTab === 'wild' && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <h3 className="font-serif font-bold text-lg text-zinc-900">Approvisionnement Responsable & Bien-être Animal</h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    100 % de peaux issues de sous-produits, exclusivement sourcées auprès d'exploitations européennes éthiques. Nous plantons deux arbres indigènes en Toscane pour chaque sac confectionné.
                  </p>
                </div>
              )}
            </div>

            {/* Feature Mini Cards */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 text-sm text-zinc-700 leading-relaxed font-light shadow-sm">
                <span className="font-mono text-xs uppercase tracking-wider text-black font-bold block mb-1">100 % Traçable</span>
                Origine certifiée, de la ferme à l'atelier florentin.
              </div>
              <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200 text-sm text-zinc-700 leading-relaxed font-light shadow-sm">
                <span className="font-mono text-xs uppercase tracking-wider text-black font-bold block mb-1">Entretien à Vie</span>
                Entretien gratuit de la bouclerie et service spa à vie.
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
