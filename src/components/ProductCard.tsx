import React, { useState } from 'react';
import { ShoppingBag, Check, Eye } from 'lucide-react';
import { Language, Product } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Colorway } from '../data/themes';

interface ProductCardProps {
  product: Product;
  lang: Language;
  colorway: Colorway;
  isDark?: boolean;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  colorway,
  isDark = true,
  onAddToCart,
  onQuickView,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [isAddedRecently, setIsAddedRecently] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultColor = product.colors[0]?.hex || '#000000';
    onAddToCart(product, selectedSize, defaultColor);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1500);
  };

  const discountPercent = product.originalPriceMAD
    ? Math.round(((product.originalPriceMAD - product.priceMAD) / product.originalPriceMAD) * 100)
    : 0;

  return (
    <article
      onClick={() => onQuickView(product)}
      className={`group relative flex flex-col rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer ${
        isDark
          ? 'bg-[#0c0d12] hover:bg-[#111319] border border-white/[0.08] hover:border-white/[0.18]'
          : 'bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 shadow-xs hover:shadow-zinc-300/40'
      }`}
    >
      {/* Product Image Slot */}
      <div
        className={`relative aspect-[4/3] sm:aspect-[4/3] w-full overflow-hidden flex items-center justify-center p-1.5 sm:p-2.5 ${
          isDark ? 'bg-[#07070a]' : 'bg-zinc-100'
        }`}
      >
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 p-2 text-center">
            <span className="font-display font-bold text-xs sm:text-sm text-zinc-300">{product.name}</span>
            <span className="text-[10px] mt-1" style={{ color: colorway.dotColor }}>Casawi Running</span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 px-1.5 sm:px-2 py-0.5 bg-red-600 text-white text-[9px] sm:text-[11px] font-mono font-black rounded tracking-wide shadow-md">
            -{discountPercent}%
          </span>
        )}

        {/* Special Drop / Best-Seller Badge */}
        {product.badge && !discountPercent && (
          <span
            className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 px-1.5 sm:px-2 py-0.5 text-white text-[9px] sm:text-[11px] font-mono font-bold uppercase rounded tracking-wide shadow-md"
            style={{ backgroundColor: colorway.accent, color: colorway.accentText }}
          >
            {product.badge[lang]}
          </span>
        )}

        {/* Hover Eye indicator */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs">
            <Eye className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Card Body (Optimized for 2 boxes side-by-side on mobile) */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-2 sm:gap-3">
        <div>
          {/* Brand & Stock Status */}
          <div className={`flex items-center justify-between text-[10px] sm:text-xs mb-1 ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            <span className="font-mono uppercase tracking-wider font-bold truncate max-w-[70%]">
              {product.brand}
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono flex items-center gap-1 shrink-0 text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t.catalog.inStock}
            </span>
          </div>

          {/* Product Title (2-line clamp) */}
          <h3
            className={`text-xs sm:text-sm font-bold leading-tight font-display tracking-tight uppercase line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] ${
              isDark ? 'text-white group-hover:text-blue-400' : 'text-zinc-950 group-hover:text-blue-600'
            } transition-colors`}
          >
            {product.name}
          </h3>

          {/* Price with MAD & Tabular Figures */}
          <div className="flex items-baseline flex-wrap gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span className={`text-sm sm:text-lg font-black font-mono tabular-nums ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              {product.priceMAD.toLocaleString()} <span className={`text-[10px] sm:text-xs font-sans font-semibold ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>{t.catalog.priceMAD}</span>
            </span>
            {product.originalPriceMAD && (
              <span className="text-[10px] sm:text-xs text-zinc-500 line-through font-mono tabular-nums">
                {product.originalPriceMAD.toLocaleString()} {t.catalog.priceMAD}
              </span>
            )}
          </div>
        </div>

        {/* Size Selection & Quick Add */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`pt-2 sm:pt-2.5 border-t space-y-2 ${
            isDark ? 'border-white/[0.08]' : 'border-zinc-200'
          }`}
        >
          {/* Compact Size Selector */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {product.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-6 h-6 sm:min-w-7 sm:h-7 px-1 text-[10px] sm:text-xs font-mono font-bold rounded flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'text-white border'
                      : isDark
                        ? 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-transparent'
                        : 'bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 border border-transparent'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: colorway.accent, color: colorway.accentText, borderColor: colorway.accent }
                      : {}
                  }
                  title={`Taille ${size}`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2 sm:py-2.5 px-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
            style={
              isAddedRecently
                ? { backgroundColor: '#10B981', color: '#000000' }
                : {
                    backgroundColor: colorway.accent,
                    color: colorway.accentText,
                    boxShadow: `0 2px 8px ${colorway.glow}`,
                  }
            }
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t.catalog.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t.catalog.addToCart}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
