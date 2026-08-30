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
        <div className="flex items-center justify-between gap-4">
          
          {/* ========================================================= */}
          {/* 1. {LOGO} - Left Aligned Minimalist Mark */}
          {/* ========================================================= */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mobile & Tablet Menu Button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
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

          {/* ========================================================= */}
          {/* 2. {LINKS} - Centered Navigation Suite (Desktop >= 1024px) */}
          {/* ========================================================= */}
          <nav className={`hidden lg:flex items-center justify-center space-x-1 lg:space-x-2 px-4 py-1.5 rounded-full text-xs lg:text-sm font-normal tracking-wide transition-all duration-300 ${
            isScrolled
              ? 'bg-white/5 backdrop-blur-md border border-white/10 text-white/80'
              : 'bg-transparent border border-transparent text-white/90'
          }`}>
            {/* Home */}
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('home')}
              className="hover:text-white hover:bg-white/10 px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
            >
              <span>Accueil</span>
            </button>

            {/* About */}
            <button
              id="nav-link-about"
              onClick={() => handleNavClick('about-section')}
              className="hover:text-white hover:bg-white/10 px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
            >
              <span>La Maison</span>
            </button>

            {/* Blog / Lookbook */}
            <button
              id="nav-link-blog"
              onClick={() => handleNavClick('editorial-lookbook')}
              className="hover:text-white hover:bg-white/10 px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
            >
              <span>Blog</span>
            </button>

            {/* Collection */}
            <button
              id="nav-link-collection"
              onClick={() => handleShopClick()}
              className="hover:text-white hover:bg-white/10 px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
            >
              <span>Collection</span>
            </button>

            {/* Contact */}
            <button
              id="nav-link-contact"
              onClick={() => handleNavClick('footer-section')}
              className="hover:text-white hover:bg-white/10 px-3.5 py-1 rounded-full transition-all duration-200 cursor-pointer"
            >
              <span>Contact</span>
            </button>
          </nav>

          {/* ========================================================= */}
          {/* 3. {BUTTON} - Right Aligned Modern "shop ↗" Pill + Actions */}
          {/* ========================================================= */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Search Trigger */}
            <button
              id="btn-nav-search"
              onClick={onOpenSearch}
              className={`p-2 rounded-full transition-all cursor-pointer ${
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

            {/* Signature "shop ↗" Pill Button */}
            <button
              id="btn-nav-shop-pill"
              onClick={handleShopClick}
              className="inline-flex items-center gap-2.5 pl-4 pr-1.5 py-1.5 bg-white text-black hover:bg-zinc-200 active:scale-95 rounded-full transition-all duration-200 cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.15)] group font-medium text-sm"
              aria-label="Voir la collection"
            >
              <span className="tracking-tight text-xs sm:text-sm font-semibold lowercase">boutique</span>
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center transition-transform group-hover:rotate-45 duration-200">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE & TABLET DRAWER NAVIGATION MENU (< 1024px) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
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

                {/* Mobile & Tablet Navigation Links */}
                <div className="space-y-1.5 py-6 text-left">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-3 pb-1">Navigation</p>
                  <button
                    onClick={() => handleNavClick('home')}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Accueil</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleNavClick('about-section')}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>La Maison</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleNavClick('editorial-lookbook')}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Blog & Lookbook</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleShopClick()}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Collection</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleNavClick('client-reviews-section')}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Avis Clients</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                  <button
                    onClick={() => handleNavClick('footer-section')}
                    className="w-full text-left px-3.5 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span>Contact</span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-600" />
                  </button>
                </div>

                {/* Category Quick Links for Tablet/Mobile */}
                <div className="pt-4 border-t border-zinc-800 space-y-2">
                  <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase px-3 pb-1">Catégories</p>
                  <div className="grid grid-cols-2 gap-2 px-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.id);
                          onNavigateSection('shop-section');
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-left px-3 py-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 rounded-xl text-xs text-zinc-300 hover:text-white transition-all truncate"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Footer CTA */}
              <div className="pt-6 border-t border-zinc-800">
                <button
                  onClick={handleShopClick}
                  className="w-full py-3.5 bg-white text-black font-semibold text-sm rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <span className="lowercase">voir la collection</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
