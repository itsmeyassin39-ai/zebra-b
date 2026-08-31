import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { Currency } from '../types';
import { CURRENCY_RATES } from '../utils/formatters';

interface AnnouncementBarProps {
  currentCurrency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  onOpenPromo: () => void;
  isScrolled?: boolean;
}

const MESSAGES = [
  {
    icon: Truck,
    text: 'LIVRAISON EXPRESS OFFERTE SUR TOUTES LES COMMANDES, PARTOUT AU MAROC',
    highlight: 'EXPRESS OFFERT',
  },
  {
    icon: Sparkles,
    text: 'LA CAPSULE MONOCHROME 2026 EST EN LIGNE — PIÈCES LIMITÉES DISPONIBLES',
    highlight: 'DÉCOUVRIR LE DROP',
  },
  {
    icon: ShieldCheck,
    text: 'CERTIFICAT NUMÉROTÉ INDIVIDUELLEMENT DE L\'ARTISANAT FLORENTIN',
    highlight: 'ENTRETIEN À VIE',
  },
];

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenPromo,
  isScrolled = false,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = MESSAGES[index];
  const Icon = current.icon;

  return (
    <div
      id="announcement-bar"
      className="bg-black text-white text-[10px] md:text-[11px] tracking-[0.2em] uppercase border-b border-white/10 py-2 px-4 relative z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: VIP Tag */}
        <button
          id="btn-vip-perk"
          onClick={onOpenPromo}
          className="hidden md:flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-zinc-300">ATELIER VIP : -15 % SUR TOUTE LA COLLECTION</span>
          <ChevronRight className="w-3 h-3" />
        </button>

        {/* Center: Dynamic Carousel Message */}
        <div
          id="announcement-message-center"
          className="flex-1 flex items-center justify-center gap-2 overflow-hidden text-center cursor-pointer group"
          onClick={onOpenPromo}
        >
          <Icon className="w-3 h-3 text-zinc-300 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="truncate font-light text-zinc-300 group-hover:text-white transition-colors">
            {current.text}
          </span>
        </div>

        {/* Right: Currency & Language Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 text-zinc-400">
            <label htmlFor="currency-select" className="sr-only">Devise</label>
            <select
              id="currency-select"
              value={currentCurrency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="bg-white/10 text-white text-[10px] tracking-wider uppercase py-0.5 px-2 rounded-md border border-white/15 focus:outline-none focus:border-white/40 cursor-pointer backdrop-blur-sm"
            >
              {(Object.keys(CURRENCY_RATES) as Currency[]).map((curr) => (
                <option key={curr} value={curr} className="bg-zinc-950 text-white">
                  {CURRENCY_RATES[curr].label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
