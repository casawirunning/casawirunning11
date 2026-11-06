import React from 'react';
import { Search, X, LayoutGrid, Grid3X3, Grid2X2 } from 'lucide-react';
import { Language, ProductCategory } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Colorway } from '../data/themes';

interface CategoryFilterProps {
  lang: Language;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  categoryCounts: Record<ProductCategory, number>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  resultsCount: number;
  colorway: Colorway;
  isDark?: boolean;
  gridColumns: 2 | 3 | 4;
  onGridColumnsChange: (cols: 2 | 3 | 4) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  lang,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  searchQuery,
  onSearchChange,
  resultsCount,
  colorway,
  isDark = true,
  gridColumns,
  onGridColumnsChange,
}) => {
  const t = TRANSLATIONS[lang];

  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: t.categories.all },
    { id: 'sets', label: t.categories.sets },
    { id: 'jackets', label: t.categories.jackets },
    { id: 'tops', label: t.categories.tops },
    { id: 'pants', label: t.categories.pants },
    { id: 'shoes', label: t.categories.shoes },
  ];

  return (
    <div className="space-y-4 mb-6 sm:mb-8">
      {/* Category Pills Bar (Ton Running Style: sleek, horizontal scrolling on mobile, high contrast) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none scroll-smooth">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'shadow-md'
                  : isDark
                    ? 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                    : 'bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 border border-zinc-200'
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: colorway.accent,
                      color: colorway.accentText,
                      boxShadow: `0 2px 10px ${colorway.glow}`,
                    }
                  : {}
              }
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] sm:text-xs font-mono font-semibold px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-black/25 text-inherit'
                    : isDark
                      ? 'bg-white/[0.08] text-zinc-400'
                      : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search & Grid Density Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.catalog.searchPlaceholder}
            className={`w-full pl-10 pr-9 rtl:pr-10 rtl:pl-9 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none ${
              isDark
                ? 'bg-white/[0.03] border border-white/[0.08] text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:bg-white/[0.05]'
                : 'bg-zinc-100 border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:bg-white shadow-xs'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 cursor-pointer p-0.5 rounded-full ${
                isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'
              }`}
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side: Results count & Grid layout selector */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className={`text-xs font-mono font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {resultsCount} {resultsCount > 1 ? t.cart.items : t.cart.item}
          </span>

          {/* Grid View Controls (Allows switching between 2 boxes, 3 boxes, 4 boxes) */}
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-zinc-100 border-zinc-200'
          }`}>
            {/* 2 boxes each other (Mobile & desktop) */}
            <button
              type="button"
              onClick={() => onGridColumnsChange(2)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono font-bold ${
                gridColumns === 2
                  ? isDark ? 'bg-white/15 text-white' : 'bg-white text-zinc-950 shadow-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-950'
              }`}
              title="2 colonnes (2 boxes côte à côte)"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2</span>
            </button>

            {/* 3 boxes */}
            <button
              type="button"
              onClick={() => onGridColumnsChange(3)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono font-bold ${
                gridColumns === 3
                  ? isDark ? 'bg-white/15 text-white' : 'bg-white text-zinc-950 shadow-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-950'
              }`}
              title="3 colonnes"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3</span>
            </button>

            {/* 4 boxes (Desktop) */}
            <button
              type="button"
              onClick={() => onGridColumnsChange(4)}
              className={`hidden md:flex p-1.5 rounded-md transition-colors cursor-pointer items-center gap-1 text-[11px] font-mono font-bold ${
                gridColumns === 4
                  ? isDark ? 'bg-white/15 text-white' : 'bg-white text-zinc-950 shadow-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-950'
              }`}
              title="4 colonnes"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>4</span>
            </button>
          </div>
        </div>
      </div>

      {searchQuery && (
        <div className={`flex items-center justify-between text-xs px-1 font-mono ${
          isDark ? 'text-zinc-400' : 'text-zinc-600'
        }`}>
          <span>
            {lang === 'ar'
              ? `نتائج البحث عن "${searchQuery}"`
              : lang === 'fr'
                ? `Résultats pour "${searchQuery}"`
                : `Results for "${searchQuery}"`}
          </span>
          <button
            onClick={() => onSearchChange('')}
            className="hover:underline font-bold cursor-pointer"
            style={{ color: colorway.dotColor }}
          >
            {t.catalog.resetFilters}
          </button>
        </div>
      )}
    </div>
  );
};
