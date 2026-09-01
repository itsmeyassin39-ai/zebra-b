import React from 'react';
import {
  Instagram,
  Facebook,
  Lock,
  ArrowUp,
  Mail,
  Phone,
  Package,
} from 'lucide-react';
import { BagCategory } from '../types';
import { useStore } from '../store/StoreContext';
import { clearSession } from '../store/auth';
import { api } from '../api/client';

const LOGO_URL = '/assets/imgs/Zebra logo (1).png';

interface FooterProps {
  onSelectCategory: (category: BagCategory | 'all') => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigateSection,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { categories } = useStore();

  return (
    <footer id="footer-section" className="bg-zinc-100 text-zinc-900 border-t border-zinc-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Brand Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-16 border-b border-zinc-200">
          
          {/* Col 1: Brand Info (5 cols) */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white border border-zinc-300 flex items-center justify-center shadow-sm overflow-hidden">
                <img
                  src={LOGO_URL}
                  alt="Zebra"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-display tracking-[0.3em] text-xl font-bold text-zinc-900 uppercase">
                ZEBRA BAGS
              </span>
            </div>

            <p className="text-xs text-zinc-600 font-light leading-relaxed max-w-sm">
              Haute maroquinerie inspirée par le contraste des rayures naturelles du zèbre et l'artisanat architectural italien. Confectionnée à la main en Toscane pour les individualistes assumés.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://www.facebook.com/Zebrabags.Official/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white border border-zinc-300 text-zinc-700 hover:text-black hover:border-black flex items-center justify-center transition-colors shadow-sm"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/zebrabags.officiel/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white border border-zinc-300 text-zinc-700 hover:text-black hover:border-black flex items-center justify-center transition-colors shadow-sm"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@zebra_bags?_r=1&_t=ZS-99Jnn4dsSZg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-white border border-zinc-300 text-zinc-700 hover:text-black hover:border-black flex items-center justify-center transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Collections (4 cols) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-900 font-bold">
              Silhouettes
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-600">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onNavigateSection('shop-section');
                    }}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    onNavigateSection('shop-section');
                  }}
                  className="hover:text-black transition-colors cursor-pointer text-left font-semibold text-zinc-900"
                >
                  Voir Toute la Collection →
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Atelier Contacts (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-900 font-bold">
              Salon Florentin
            </h4>
            <ul className="space-y-3 text-xs text-zinc-600">
              
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-zinc-700 shrink-0" />
                <span>+212779440140</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-700 shrink-0" />
                <span>Zebrabegs@gmail.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex flex-col gap-1.5">
            <span>© 2026 ZEBRA BAGS S.R.L. Tous droits réservés. Confectionné à la main en Toscane.</span>
            <a
              href="#/dashboard"
              className="text-zinc-400 hover:text-zinc-900 transition-colors underline underline-offset-4 decoration-dotted"
            >
              Espace gestion (tableau de bord)
            </a>
            <button
              onClick={() => {
                api('/api/auth/logout', { method: 'POST' })
                  .catch(() => undefined)
                  .finally(() => {
                    clearSession();
                    window.location.reload();
                  });
              }}
              className="text-left text-zinc-400 hover:text-zinc-900 transition-colors underline underline-offset-4 decoration-dotted cursor-pointer"
            >
              Se déconnecter
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-zinc-700" /> SSL Sécurisé et Chiffré</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-300 text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer shadow-sm font-bold"
              title="Remonter en haut"
            >
              <span>Haut</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Credit Line */}
        <div className="mt-8 pt-6 border-t border-zinc-200 text-center text-xs text-zinc-500 font-mono">
          Made with <span className="text-red-500">♥</span> by{' '}
          <a
            href="https://www.instagram.com/rd21.js/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-900 font-bold underline underline-offset-4 decoration-zinc-400 hover:text-black hover:decoration-black transition-colors"
          >
            rd21.js
          </a>
        </div>

      </div>
    </footer>
  );
};
