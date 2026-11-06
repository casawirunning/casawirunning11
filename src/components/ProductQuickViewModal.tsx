import React, { useState } from 'react';
import { X, Check, ShoppingBag, Truck, ShieldCheck, Ruler } from 'lucide-react';
import { Language, Product } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Colorway } from '../data/themes';

interface ProductQuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  colorway: Colorway;
  isDark?: boolean;
  onAddToCart: (product: Product, size: string, color: string) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  lang,
  colorway,
  isDark = true,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const t = TRANSLATIONS[lang];
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.hex || '#000000');
  const [isAddedRecently, setIsAddedRecently] = useState<boolean>(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setIsAddedRecently(true);
    setTimeout(() => {
      setIsAddedRecently(false);
      onClose();
    }, 1000);
  };

  const discountPercent = product.originalPriceMAD
    ? Math.round(((product.originalPriceMAD - product.priceMAD) / product.originalPriceMAD) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div
        className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200 border ${
          isDark
            ? 'bg-[#0c0d12] border-white/[0.09] text-zinc-100'
            : 'bg-white border-zinc-200 text-zinc-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square sm:aspect-auto w-full bg-black flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 rtl:left-auto rtl:right-4 px-2.5 py-1 bg-red-600 text-white text-xs font-mono font-black rounded-md tracking-wider">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Product Info & Purchase Controls */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Brand and Badge */}
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono uppercase font-bold text-zinc-400">{product.brand}</span>
                {product.badge && (
                  <span
                    className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${colorway.accent}20`, color: colorway.accent }}
                  >
                    {product.badge[lang]}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black font-display uppercase tracking-tight leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-2.5 mt-2.5">
                <span className="text-2xl font-black font-mono tabular-nums">
                  {product.priceMAD.toLocaleString()} <span className="text-xs font-sans font-semibold text-zinc-400">{t.catalog.priceMAD}</span>
                </span>
                {product.originalPriceMAD && (
                  <span className="text-sm text-zinc-400 line-through font-mono tabular-nums">
                    {product.originalPriceMAD.toLocaleString()} {t.catalog.priceMAD}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {product.description[lang]}
              </p>

              {/* Size Selector */}
              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold uppercase tracking-wider">{t.productModal.size}: {selectedSize}</span>
                  <span className="text-[11px] text-zinc-400 font-mono">Standard Fit</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-10 h-9 px-3 text-xs font-mono font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'text-white border'
                            : isDark
                              ? 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/[0.08]'
                              : 'bg-zinc-100 text-zinc-700 hover:text-black border-zinc-200'
                        }`}
                        style={
                          isSelected
                            ? { backgroundColor: colorway.accent, color: colorway.accentText, borderColor: colorway.accent }
                            : {}
                        }
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors */}
              {product.colors.length > 1 && (
                <div className="mt-3">
                  <span className="text-xs font-bold uppercase tracking-wider block mb-2">
                    {t.productModal.color}: {product.colors.find((c) => c.hex === selectedColor)?.name[lang]}
                  </span>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          selectedColor === c.hex ? 'scale-110 border-white ring-2 ring-blue-500' : 'border-zinc-700'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name[lang]}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features Bullet Points */}
              <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-1">
                {product.features[lang].map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button & COD reassurance */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xl"
                style={
                  isAddedRecently
                    ? { backgroundColor: '#10B981', color: '#000000' }
                    : {
                        backgroundColor: colorway.accent,
                        color: colorway.accentText,
                        boxShadow: `0 4px 16px ${colorway.glow}`,
                      }
                }
              >
                {isAddedRecently ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{t.catalog.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.catalog.addToCart} — {product.priceMAD} {t.catalog.priceMAD}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 font-mono text-center">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-blue-400" />
                  Livraison 24h-48h Maroc
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Paiement Cash (COD)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
