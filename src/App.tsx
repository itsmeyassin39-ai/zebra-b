import React, { useState, useEffect } from 'react';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';

import { FeaturedProducts } from './components/FeaturedProducts';
import { Footer } from './components/Footer';

import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';

import { Product, Currency, CartItem } from './types';
import { useStore } from './store/StoreContext';
import AuthGate from './components/AuthGate';
import Dashboard from './pages/Dashboard';
import TrackOrder from './pages/TrackOrder';
import { CategoryPage } from './pages/CategoryPage';

export default function App() {
  const { products, loading, error, refresh } = useStore();

  const [route, setRoute] = useState<string>('');

  useEffect(() => {
    // Never open on the dashboard: entering/reloading the site always starts
    // on the store. The dashboard is only reachable via "Espace gestion".
    if (window.location.hash.startsWith('#/dashboard')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const handleHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // State management
  const [currentCurrency, setCurrentCurrency] = useState<Currency>('DH');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Cart State (initialize with 1 signature piece for an instant live feeling)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (!products[0] || !products[0].colors[0]) return [];
    return [
      {
        id: 'initial-savanna-item',
        productId: products[0].id,
        product: products[0],
        selectedColor: products[0].colors[0],
        selectedHardware: 'Argent brossé Palladium',
        personalizedMonogram: 'ZB',
        quantity: 1,
      },
    ];
  });

  // Wishlist State (initialize with 1 item)
  const [wishlistIds, setWishlistIds] = useState<string[]>(
    products[1] ? [products[1].id] : []
  );

  // Scroll state for header styling
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Discount & Gift Notes from Cart to Checkout
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [giftNote, setGiftNote] = useState('');

  // Cart calculations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Wishlist list
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Navigation smoothly to anchor
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add standard product to cart
  const handleAddToCart = (
    product: Product,
    selectedColorIdx: number = 0,
    hardware: string = 'Argent brossé Palladium',
    monogram?: string,
    quantity: number = 1
  ) => {
    const color = product.colors[selectedColorIdx] || product.colors[0];
    const existingIndex = cartItems.findIndex(
      (it) =>
        it.productId === product.id &&
        it.selectedColor.name === color.name &&
        it.selectedHardware === hardware &&
        it.personalizedMonogram === monogram
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += quantity;
      setCartItems(updated);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        product,
        selectedColor: color,
        selectedHardware: hardware,
        personalizedMonogram: monogram,
        quantity,
      };
      setCartItems((prev) => [newItem, ...prev]);
    }
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQ = item.quantity + delta;
            return newQ > 0 ? { ...item, quantity: newQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
  };

  const handleProceedToCheckout = (discountPercent: number, note: string) => {
    setAppliedDiscount(discountPercent);
    setGiftNote(note);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg">
          <img src="/assets/imgs/Zebra logo (1).png" alt="Zebra Bags" className="w-full h-full object-contain p-2" />
        </div>
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
        <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
          Chargement…
        </p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-5 p-6 text-center">
        <p className="text-2xl">🔌</p>
        <h1 className="font-display text-xl font-extrabold">Impossible de joindre le serveur</h1>
        <p className="text-zinc-400 text-sm max-w-md">
          Démarrez le serveur avec <code className="bg-zinc-800 px-2 py-0.5 rounded">npm run server</code> puis réessayez.
        </p>
        <button
          onClick={() => refresh()}
          className="px-6 py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (route.startsWith('#/dashboard')) {
    return (
      <AuthGate>
        <Dashboard onClose={() => { window.location.hash = ''; }} />
      </AuthGate>
    );
  }

  if (route.startsWith('#/track')) {
    return (
      <TrackOrder onClose={() => { window.location.hash = ''; }} />
    );
  }

  const categoryMatch = route.match(/^#\/category\/([^/]+)/);
  const categoryId = categoryMatch ? decodeURIComponent(categoryMatch[1]) : null;

  return (
      <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">

      {/* Unified Modern Header (Merged over Hero) */}
      <div className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
        <AnnouncementBar
          currentCurrency={currentCurrency}
          onCurrencyChange={setCurrentCurrency}
          onOpenPromo={() => handleNavigateSection('newsletter-section')}
          isScrolled={isScrolled}
        />
        <Navbar
          cartCount={cartCount}
          cartSubtotal={cartSubtotal}
          wishlistCount={wishlistIds.length}
          currentCurrency={currentCurrency}
          onCurrencyChange={setCurrentCurrency}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onSelectCategory={(cat) => setActiveCategory(cat)}
          onSelectProduct={(prod) => setQuickViewProduct(prod)}
          onNavigateSection={handleNavigateSection}
        />
      </div>

      {categoryId ? (
        <CategoryPage
          categoryId={categoryId}
          currentCurrency={currentCurrency}
          wishlistIds={wishlistIds}
          onQuickView={(prod) => setQuickViewProduct(prod)}
          onAddToCart={(prod, colorIdx) => handleAddToCart(prod, colorIdx)}
          onToggleWishlist={handleToggleWishlist}
          onHome={() => { window.location.hash = ''; }}
        />
      ) : (
        <>
          {/* 3. Hero Section */}
          <Hero
            currentCurrency={currentCurrency}
            onShopClick={() => handleNavigateSection('shop-section')}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onAddToCart={(prod) => handleAddToCart(prod)}
          />

          {/* 7. Featured Products Section with Tabs & Filters */}
          <FeaturedProducts
            activeCategory={activeCategory}
            currentCurrency={currentCurrency}
            wishlistIds={wishlistIds}
            onSelectCategory={setActiveCategory}
            onQuickView={(prod) => setQuickViewProduct(prod)}
            onAddToCart={(prod, colorIdx) => handleAddToCart(prod, colorIdx)}
            onToggleWishlist={handleToggleWishlist}
          />

          {/* 13. Professional Luxury Footer */}
          <Footer
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              handleNavigateSection('shop-section');
            }}
            onNavigateSection={handleNavigateSection}
          />
        </>
      )}

      {/* Interactive Modals & Slide-out Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currentCurrency={currentCurrency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        wishlistProducts={wishlistProducts}
        currentCurrency={currentCurrency}
        onClose={() => setIsWishlistOpen(false)}
        onRemoveFromWishlist={(id) => setWishlistIds((prev) => prev.filter((i) => i !== id))}
        onMoveToCart={(prod) => handleAddToCart(prod)}
        onQuickView={(prod) => setQuickViewProduct(prod)}
      />

      <QuickViewModal
        product={quickViewProduct}
        currentCurrency={currentCurrency}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(prod, colIdx, hw, mono, qty) => {
          handleAddToCart(prod, colIdx, hw, mono, qty);
          setQuickViewProduct(null);
        }}
        onToggleWishlist={handleToggleWishlist}
      />

      <SearchModal
        isOpen={isSearchOpen}
        currentCurrency={currentCurrency}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(prod) => {
          setQuickViewProduct(prod);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        items={cartItems}
        currentCurrency={currentCurrency}
        appliedDiscountPercent={appliedDiscount}
        giftNote={giftNote}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderCompleted}
      />

    </div>
  );
}
