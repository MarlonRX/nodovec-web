import { Search, X, SlidersHorizontal } from "lucide-react";
import { MySelect } from "@/components/UIComponents/MySelect";
import { MyInput } from "@/components/UIComponents/MyInput";

interface TransactionsFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  filterType: string;
  onFilterTypeChange: (v: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (v: string) => void;
  categoryOptions: { value: string; label: string }[];
  onClearFilters: () => void;
  totalCount: number;
  debouncedSearch: string;
  t: (key: string) => string;
}

export const TransactionsFilters = ({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  filterType,
  onFilterTypeChange,
  filterCategory,
  onFilterCategoryChange,
  categoryOptions,
  onClearFilters,
  totalCount,
  debouncedSearch,
  t,
}: TransactionsFiltersProps) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--text-tertiary) z-10" />
        <MyInput
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('transactions.searchPlaceholder') || 'Search transactions...'}
          aria-label={t('transactions.searchPlaceholder') || 'Search transactions...'}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-tertiary) hover:text-(--text-primary) transition-colors z-10">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <button onClick={onToggleFilters} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors text-sm font-semibold ${showFilters || hasActiveFilters ? 'bg-(--accent-primary) text-(--text-inverted) border-(--accent-primary)' : 'bg-(--bg-secondary) text-(--text-primary) border-(--border-primary) hover:border-(--accent-primary)'}`}>
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">{t('transactions.filters') || 'Filters'}</span>
        {hasActiveFilters && <span className="ml-1 w-5 h-5 rounded-full bg-(--text-inverted) text-(--accent-primary) text-xs font-bold flex items-center justify-center">{[debouncedSearch, filterType, filterCategory].filter(Boolean).length}</span>}
      </button>
    </div>
    {showFilters && (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 rounded-lg bg-(--bg-secondary) border border-(--border-primary)">
        <MySelect options={[{ value: '', label: t('transactions.allTypes') || 'All Types' }, { value: 'income', label: t('transactions.typeIncome') || 'Income' }, { value: 'expense', label: t('transactions.typeExpense') || 'Expense' }]} value={filterType} onChange={(e: any) => onFilterTypeChange(e.target.value)} className="w-full sm:w-40 h-10 text-sm font-semibold border-none bg-(--bg-primary) rounded-lg" />
        <MySelect options={categoryOptions} value={filterCategory} onChange={(e: any) => onFilterCategoryChange(e.target.value)} className="w-full sm:w-48 h-10 text-sm font-semibold border-none bg-(--bg-primary) rounded-lg" />
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-(--semantic-error) hover:bg-[rgba(207,102,121,0.1)] rounded-lg transition-colors">
            <X className="w-3 h-3" />{t('transactions.clearFilters') || 'Clear'}
          </button>
        )}
      </div>
    )}
    {hasActiveFilters && (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-(--text-tertiary) font-semibold">{totalCount} {totalCount === 1 ? (t('transactions.result') || 'result') : (t('transactions.results') || 'results')}</span>
        {debouncedSearch && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--accent-primary) text-(--text-inverted)"><Search className="w-3 h-3" />"{debouncedSearch}"<button onClick={() => onSearchChange('')} aria-label="Clear search" className="hover:opacity-70"><X className="w-3 h-3" /></button></span>}
        {filterType && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--bg-secondary) text-(--text-primary) border border-(--border-primary)">{filterType}<button onClick={() => onFilterTypeChange('')} aria-label="Clear type filter" className="hover:opacity-70"><X className="w-3 h-3" /></button></span>}
        {filterCategory && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-(--bg-secondary) text-(--text-primary) border border-(--border-primary)">{filterCategory.replace(/_/g, ' ')}<button onClick={() => onFilterCategoryChange('')} aria-label="Clear category filter" className="hover:opacity-70"><X className="w-3 h-3" /></button></span>}
      </div>
    )}
  </div>
);
