import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Sparkles, Truck, ShieldCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { Language, Product, CartItem, StoreSettings, ProductCategory } from './types';
import { TRANSLATIONS } from './data/translations';
import { INITIAL_PRODUCTS, HERO_BANNER_IMAGE } from './data/products';
import { COLORWAYS } from './data/themes';
import { Navbar } from './components/Navbar';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WhatsAppSuccessModal } from './components/WhatsAppSuccessModal';
import { Footer } from './components/Footer';

const SETTINGS_STORAGE_KEY = 'casawi_running_settings';
const CART_STORAGE_KEY = 'casawi_running_cart';
const LANG_STORAGE_KEY = 'casawi_running_lang';
const THEME_STORAGE_KEY = 'casawi_running_theme';
const GRID_STORAGE_KEY = 'casawi_running_grid_cols';

export default function App() {
  // Store Settings (Correct phone number: 0681031407 & casawirunning1)
  const [settings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Correct previous phone number typo automatically
        if (!parsed.whatsappNumber || parsed.whatsappNumber.includes('681031707') || parsed.whatsappNumber.includes('694940173')) {
          parsed.whatsappNumber = '0681031407';
        }
        return parsed;
      }
    } catch {
      // Ignore
    }
    return {
      whatsappNumber: '0681031407',
      tiktokHandle: 'casawirunning1',
      storeName: 'Casawi Running',
    };
  });

  // Dark / Light theme mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved !== null) return saved === 'dark';
    } catch {
      // Ignore
    }
    return true; // Default dark mode
  });

  // Locked permanently to Electric Blue
  const colorway = COLORWAYS['hyper-blue'];

  // Language state (default to 'fr', popular in Moroccan apparel & WhatsApp commerce)
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved && (saved === 'fr' || saved === 'ar' || saved === 'en')) return saved;
    } catch {
      // Ignore
    }
    return 'fr';
  });

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  // Grid columns state: 2 by default so on mobile phone it renders 2 boxes side-by-side!
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4>(() => {
    try {
      const saved = localStorage.getItem(GRID_STORAGE_KEY);
      if (saved === '2' || saved === '3' || saved === '4') {
        return parseInt(saved, 10) as 2 | 3 | 4;
      }
    } catch {
      // Ignore
    }
    return 2; // Default 2 boxes side-by-side
  });

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return [];
  });

  // Catalog search
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Success Receipt Modal
  const [successReceipt, setSuccessReceipt] = useState<{
    isOpen: boolean;
    receiptText: string;
    whatsappUrl: string;
  }>({
    isOpen: false,
    receiptText: '',
    whatsappUrl: '',
  });

  // Sync Theme to html tag & localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // Ignore
    }
  }, [isDark]);

  // Sync Language and Direction on <html> tag
  useEffect(() => {
    const isRtl = lang === 'ar';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  }, [lang]);

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  // Sync Grid setting
  useEffect(() => {
    try {
      localStorage.setItem(GRID_STORAGE_KEY, gridColumns.toString());
    } catch {
      // Ignore
    }
  }, [gridColumns]);

  // Add Item to Cart
  const handleAddToCart = (
    product: Product,
    selectedSize: string,
    selectedColor: string,
    quantity: number = 1
  ) => {
    setCartItems((prev) => {
      const instanceId = `${product.id}-${selectedSize}-${selectedColor}`;
      const existingIdx = prev.findIndex((item) => item.id === instanceId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: instanceId,
          product,
          selectedSize,
          selectedColor,
          quantity,
        },
      ];
    });
  };

  // Update Item Quantity
  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  // Remove Item
  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Handle Checkout submission
  const handleCheckoutSuccess = (receiptText: string, whatsappUrl: string) => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCartItems([]); // Order submitted, clear cart
    setSuccessReceipt({
      isOpen: true,
      receiptText,
      whatsappUrl,
    });
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      all: INITIAL_PRODUCTS.length,
      sets: INITIAL_PRODUCTS.filter((p) => p.category === 'sets').length,
      jackets: INITIAL_PRODUCTS.filter((p) => p.category === 'jackets').length,
      tops: INITIAL_PRODUCTS.filter((p) => p.category === 'tops').length,
      pants: INITIAL_PRODUCTS.filter((p) => p.category === 'pants').length,
      shoes: INITIAL_PRODUCTS.filter((p) => p.category === 'shoes').length,
    };
    return counts;
  }, []);

  // Filtered Products (by Category + Search)
  const filteredProducts = useMemo(() => {
    let list = INITIAL_PRODUCTS;
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesBrand = product.brand.toLowerCase().includes(query);
      const matchesDesc = product.description[lang].toLowerCase().includes(query);
      return matchesName || matchesBrand || matchesDesc;
    });
  }, [selectedCategory, searchQuery, lang]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartValueMAD = cartItems.reduce((acc, item) => acc + item.product.priceMAD * item.quantity, 0);
  const t = TRANSLATIONS[lang];

  // Responsive grid class: on mobile (< sm), it always renders in 2 boxes (grid-cols-2)
  const gridLayoutClass = useMemo(() => {
    if (gridColumns === 2) {
      return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6';
    }
    if (gridColumns === 3) {
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6';
    }
    // gridColumns === 4
    return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6';
  }, [gridColumns]);

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-blue-600 selection:text-white ${
      isDark ? 'bg-[#070709] text-zinc-100' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Top Announcement Bar (Ton Running Style) */}
      <div className={`text-[11px] sm:text-xs font-semibold py-2 px-3 sm:px-4 text-center tracking-wider flex items-center justify-center gap-2 sm:gap-4 transition-colors overflow-x-auto whitespace-nowrap scrollbar-none ${
        isDark
          ? 'bg-[#0b0c10] border-b border-white/[0.08] text-zinc-300'
          : 'bg-zinc-900 text-zinc-200 border-b border-zinc-800'
      }`}>
        <span className="flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <strong className="text-white uppercase">LIVRAISON GRATUITE DÈS 500 DH</strong>
        </span>
        <span className="opacity-40" aria-hidden="true">·</span>
        <span className="font-mono text-emerald-400 font-bold">PAIEMENT CASH À LA LIVRAISON (COD)</span>
        <span className="hidden md:inline opacity-40" aria-hidden="true">·</span>
        <a
          href={`https://wa.me/212681031407`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 hover:text-white font-mono"
        >
          WHATSAPP: <span className="underline font-bold">0681031407</span>
        </a>
      </div>

      {/* Top Bar Navigation */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        settings={settings}
        colorway={colorway}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
      />

      {/* Ton Running Campaign Hero Section */}
      <section className="relative overflow-hidden bg-[#070709] border-b border-white/[0.08]">
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_BANNER_IMAGE}
            alt="Ton Running Streetwear Drops"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-right md:object-center filter brightness-[0.35] contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/85 md:via-[#070709]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-[#070709]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
                TON RUNNING · CASABLANCA DROPS
              </span>
              <span className="w-8 h-[2px] bg-blue-500 rounded-full" />
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase leading-[1.05]">
              {lang === 'ar' ? 'تشكيلة الجري والستريت وير الحصرية' : 'PERFORMANCE RUNNING & STREETWEAR'}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 mt-3 sm:mt-4 leading-relaxed max-w-lg">
              {lang === 'ar'
                ? 'أحدث أطقم التك فليس، السترات الواقية والقطع الرياضية المحدودة مع التوصيل السريع والدفع كاش عند الاستلام في جميع مدن المغرب.'
                : 'Les nouveaux drops exclusifs : ensembles complets, windrunners, t-shirts respirants et tech fleece. Commandez directement en 1 clic sur WhatsApp avec paiement à la livraison.'}
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <a
                href="#drops"
                className="px-5 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
              >
                <span>{lang === 'ar' ? 'تصفح الـ 20 قطعة' : 'VOIR LES 20 ARTICLES'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </a>

              <a
                href={`https://wa.me/212681031407?text=${encodeURIComponent('Salam Ton Running, je souhaite commander !')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] flex items-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>0681031407</span>
              </a>
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/[0.1] text-zinc-300">
              <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Livraison 24-48h</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paiement Cash (COD)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>20 Pièces Clés</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Products Catalog */}
      <main id="drops" className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Section Heading */}
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-4 border-b ${
          isDark ? 'border-white/[0.08]' : 'border-zinc-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-500">
                COLLECTION 2026
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold font-display tracking-tight uppercase ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              {lang === 'ar' ? 'جميع القطع والإصدارات' : lang === 'fr' ? 'TOUS LES ARTICLES' : 'ALL PIECES'}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {lang === 'ar'
                ? '20 قطعة مختارة من ملابس الجري الحضرية والستريت وير'
                : '20 pièces exclusives sélectionnées pour le running & le streetwear'}
            </p>
          </div>
        </div>

        {/* Categories, Search & View Controls */}
        <CategoryFilter
          lang={lang}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categoryCounts={categoryCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={filteredProducts.length}
          colorway={colorway}
          isDark={isDark}
          gridColumns={gridColumns}
          onGridColumnsChange={setGridColumns}
        />

        {/* Product Cards Grid: renders 2 boxes each other on mobile phones! */}
        {filteredProducts.length > 0 ? (
          <div className={gridLayoutClass}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                lang={lang}
                colorway={colorway}
                isDark={isDark}
                onAddToCart={handleAddToCart}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        ) : (
          <div className={`p-10 text-center rounded-2xl border space-y-3 ${
            isDark ? 'bg-white/[0.02] border-white/[0.08]' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <p className={`text-base font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {t.catalog.noResults}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer bg-blue-600 text-white"
            >
              {t.catalog.resetFilters}
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        settings={settings}
        colorway={colorway}
        isDark={isDark}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        lang={lang}
        colorway={colorway}
        isDark={isDark}
        onAddToCart={handleAddToCart}
      />

      {/* Floating Basket in Right-Down Corner */}
      <aside aria-label="Floating Cart">
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-5 right-5 rtl:right-auto rtl:left-5 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full font-bold shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20 bg-blue-600 text-white"
          style={{
            boxShadow: `0 8px 30px ${colorway.glow}, 0 4px 12px rgba(0,0,0,0.5)`,
          }}
          title={t.cart.title}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-blue-700 text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center font-mono shadow-md">
                {totalCartCount}
              </span>
            )}
          </div>
          <span className="text-xs uppercase tracking-wider font-extrabold font-display">
            {lang === 'ar' ? 'السلة' : lang === 'fr' ? 'Panier' : 'Bag'}
          </span>
          {totalCartCount > 0 && (
            <span className="text-xs font-mono font-bold border-l rtl:border-l-0 rtl:border-r border-white/30 pl-2 rtl:pl-0 rtl:pr-2">
              {totalCartValueMAD.toLocaleString()} {t.catalog.priceMAD}
            </span>
          )}
        </button>
      </aside>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        lang={lang}
        colorway={colorway}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Moroccan Courier Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        lang={lang}
        settings={settings}
        colorway={colorway}
        onSuccess={handleCheckoutSuccess}
      />

      {/* WhatsApp Success Receipt Modal */}
      <WhatsAppSuccessModal
        isOpen={successReceipt.isOpen}
        onClose={() => setSuccessReceipt((prev) => ({ ...prev, isOpen: false }))}
        receiptText={successReceipt.receiptText}
        whatsappUrl={successReceipt.whatsappUrl}
        lang={lang}
        settings={settings}
        colorway={colorway}
        isLight={!isDark}
      />
    </div>
  );
}
