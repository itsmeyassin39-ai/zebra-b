import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  ArrowUpRight,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Currency, Product } from '../types';
import { useStore } from '../store/StoreContext';

const LOGO_URL = '/assets/imgs/Zebra logo (1).png';

interface NavbarProps {
  cartCount: number;
  cartSubtotal: number;
  wishlistCount: number;
  currentCurrency: Currency;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (category: string) => void;
  onSelectProduct: (product: Product) => void;
  onNavigateSection: (sectionId: string) => void;
  onCurrencyChange?: (curr: Currency) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onSelectCategory,
  onNavigateSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { categories } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigateSection(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleShopClick = () => {
    onSelectCategory('all');
    onNavigateSection('shop-section');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
    <header
      id="main-navbar-header"
      className={`w-full transition-all duration-500 ${
        isScrolled
          ? 'py-3 bg-zinc-950/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.5)] text-white'
          : 'py-3 sm:py-5 bg-transparent border-b border-transparent text-white'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8">
        {/* Modern 3-Element Direct Minimalist Bar: {logo} {links} {button} */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* ========================================================= */}
          {/* 1. {LOGO} - Left Aligned Minimalist Mark */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Menu Button (all breakpoints) */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex p-2 -ml-2 text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              aria-label="Ouvrir le menu de navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Iconic Geometric Mark & Brand Title */}
            <button
              id="brand-logo-button"
              onClick={() => handleNavClick('home')}
              className="inline-flex items-center gap-2.5 group cursor-pointer focus:outline-none select-none text-left"
              aria-label="Accueil Zebra"
            >
              {/* Zebra Logo Image */}
              <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black tracking-tighter text-base shadow-sm group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                <img
                  src={LOGO_URL}
                  alt="Zebra"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Minimal Brand Wordmark */}
              <span className="font-display tracking-[0.22em] text-sm sm:text-base font-bold text-white uppercase group-hover:text-zinc-300 transition-colors">
                ZEBRA
              </span>
            </button>
          </div>

          {/* Centered nav links removed — navigation is via the menu (categories) */}

          {/* ========================================================= */}
          {/* 3. {BUTTON} - Right Aligned Actions */}
          {/* ========================================================= */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Search Trigger */}
            <button
              id="btn-nav-search"
              onClick={onOpenSearch}
              className={`hidden min-[400px]:flex p-2 rounded-full transition-all cursor-pointer ${
                isScrolled
                  ? 'text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-sm'
                  : 'text-white hover:bg-white/10 border border-transparent'
              }`}
              title="Rechercher dans la collection (⌘K)"
              aria-label="Recherche"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Trigger */}
            <button
              id="btn-nav-wishlist"
              onClick={onOpenWishlist}
              className={`p-2 rounded-full transition-all relative cursor-pointer ${
                isScrolled
                  ? 'text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-sm'
                  : 'text-white hover:bg-white/10 border border-transparent'
              }`}
              title="Articles enregistrés"
              aria-label="Liste de souhaits"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Trigger */}
            <button
              id="btn-nav-cart"
              onClick={onOpenCart}
              className={`p-2 rounded-full transition-all relative cursor-pointer ${
                isScrolled
                  ? 'text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 backdrop-blur-sm'
                  : 'text-white hover:bg-white/10 border border-transparent'
              }`}
              title="Panier"
              aria-label="Panier"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            </div>
        </div>
      </div>
    </header>

    {/* ========================================================= */}
    {/* CATEGORIES MENU (all breakpoints) */}
    {/* ========================================================= */}
    <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-out Panel */}
            <motion.div
              id="mobile-drawer-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 max-w-sm w-full bg-[#0d0d0f] border-r border-zinc-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-zinc-800">
                  <div className="flex items-center gap-2.5">
<div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black overflow-hidden">
                    <img
                      src={LOGO_URL}
                      alt="Zebra"
                      className="w-full h-full object-contain"
                    />
                  </div>
                    <span className="font-display tracking-[0.2em] text-sm font-bold text-white uppercase">
                      ZEBRA
                    </span>
                  </div>

                  <button
                    id="btn-close-mobile-menu"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                    aria-label="Fermer la navigation"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories (main menu) */}
                <div className="py-6">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-3 pb-1">Catégories</p>
                  <div className="space-y-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.hash = `#/category/${encodeURIComponent(cat.id)}`;
                        }}
                        className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                      >
                        <span>{cat.name}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* General Navigation */}
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-3 pb-1">Navigation</p>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Accueil</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="pt-6 border-t border-zinc-800">
                <button
                  onClick={handleShopClick}
                  className="w-full py-3.5 bg-white text-black font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <span className="lowercase">voir toute la collection</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
    </AnimatePresence>
  </>
  );
};
