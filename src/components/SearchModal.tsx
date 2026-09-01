import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { Product, Currency } from '../types';
import { useStore } from '../store/StoreContext';
import { formatPrice } from '../utils/formatters';

interface SearchModalProps {
  isOpen: boolean;
  currentCurrency: Currency;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

const TRENDING_SEARCHES = [
  'Cabas Savanna',
  'Bandoulière Equus',
  'Grand Week-end',
  'Poil de Zèbre',
  'Sac à Dos',
  'Porte-Cartes',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  currentCurrency,
  onClose,
  onSelectProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { products } = useStore();

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.zebraAccentStyle.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div
        id="search-modal-card"
        className="relative z-10 max-w-2xl w-full bg-[#111114] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher sacs de luxe, matières, accents zébrés..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs rounded font-mono uppercase"
          >
            ESC
          </button>
        </div>

        {/* Results or Trending Queries */}
        <div className="p-6 max-h-[60vh] overflow-y-auto text-left space-y-6">
          {searchTerm.trim() ? (
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
                <span>Résultats de Recherche</span>
                <span>{searchResults.length} créations trouvées</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 space-y-2">
                  <p className="text-sm">Aucune création de luxe ne correspond à « {searchTerm} ».</p>
                  <p className="text-xs text-zinc-500">Essayez de rechercher « cabas », « bandoulière » ou « duffel ».</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        onSelectProduct(product);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images.main}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover border border-zinc-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-zinc-200">
                            {product.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-light">
                            {product.categoryName} • {product.zebraAccentStyle}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-white font-mono block">
                          {formatPrice(product.price, currentCurrency)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          ★ {product.rating}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Trending Searches */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Recherches Tendance</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((query) => (
                    <button
                      key={query}
                      onClick={() => setSearchTerm(query)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Suggested Products */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <span className="text-xs text-zinc-400 font-mono uppercase tracking-widest block">
                  Recommandations Signature
                </span>
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
                  {products.slice(0, 2).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer group flex items-center gap-3"
                    >
                      <img
                        src={prod.images.main}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="overflow-hidden">
                        <h5 className="text-xs font-bold text-white truncate group-hover:text-zinc-200">
                          {prod.name}
                        </h5>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {formatPrice(prod.price, currentCurrency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
