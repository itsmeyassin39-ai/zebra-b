import React from 'react';
import { Award, Feather, ShieldCheck, Gift, Truck } from 'lucide-react';

const PERKS = [
  {
    icon: Award,
    title: 'Confection Artisanale Florentine',
    description: 'Chaque pièce est montée à la main par des maîtres artisans maroquiniers de deuxième génération en Toscane.',
  },
  {
    icon: Feather,
    title: 'Cuir Italien 100 % Traçable',
    description: 'Cuir de veau tanné végétal certifié or avec finitions durables non toxiques.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantie Artisanale à Vie',
    description: 'Restauration de la bouclerie et service de nourrissage du cuir gratuits à vie.',
  },
  {
    icon: Gift,
    title: 'Emballage Cadeau Zébré Sur Mesure',
    description: 'Présenté dans notre coffret magnétique monochrome signature avec certificat sérié.',
  },
  {
    icon: Truck,
    title: 'Livraison Express Mondiale Neutre en Carbone',
    description: 'Livraison DHL Express prioritaire offerte sur toutes les commandes, sans minimum d\'achat.',
  },
];

export const BrandPerks: React.FC = () => {
  return (
    <section id="brand-perks-section" className="bg-zinc-50 border-b border-zinc-200 py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
          {PERKS.map((perk, idx) => {
            const Icon = perk.icon;
            return (
              <div
                key={idx}
                id={`brand-perk-${idx}`}
                className="flex flex-col items-start p-5 rounded-xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-all shadow-sm group"
              >
                <div className="p-2.5 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-900 mb-3 group-hover:bg-black group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-zinc-900 tracking-wider uppercase mb-1">
                  {perk.title}
                </h4>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  {perk.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
