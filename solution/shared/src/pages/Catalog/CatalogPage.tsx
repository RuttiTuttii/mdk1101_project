import { motion, AnimatePresence } from "framer-motion";
import { PixelIcon } from "../../components/Common/PixelIcon";
import { ProductCard } from "../../components/Catalog/ProductCard";
import { type CatalogFilters, type Product } from "../../types";

interface CatalogPageProps {
  summary: { total: number; manufacturers: number };
  products: Product[];
  manufacturers: string[];
  filters: CatalogFilters;
  loading: boolean;
  error: string | null;
  onFiltersChange: (filters: CatalogFilters) => void;
  onOrder: (article: string) => Promise<void>;
  onProduct: (article: string) => void;
  defaultFilters: CatalogFilters;
}

export function CatalogPage({
  summary,
  products,
  manufacturers,
  filters,
  loading,
  error,
  onFiltersChange,
  onOrder,
  onProduct,
  defaultFilters,
}: CatalogPageProps) {
  return (
    <div className="space-y-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* заголовок страницы и общая статистика */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-black pb-4 gap-4"
      >
        <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="w-16 h-16 bg-white border border-black flex items-center justify-center p-2"
            >
                <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
            </motion.div>
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tighter">Список товаров</h1>
                <p className="text-xs sm:text-sm opacity-70">каталог доступной продукции</p>
            </div>
        </div>
        
        <div className="text-right flex sm:flex-col gap-4 sm:gap-0">
            <div className="flex gap-4 text-[10px] sm:text-xs font-bold uppercase">
                <span>Товаров: {summary.total}</span>
                <span>Брендов: {summary.manufacturers}</span>
            </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* панель фильтрации товаров */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border-2 border-black p-6 space-y-6 bg-[#FFFFFF] h-fit"
        >
          <div className="flex items-center justify-between border-b border-black pb-2">
            <h2 className="text-xl font-bold">Фильтрация</h2>
            <PixelIcon.Filter />
          </div>
          
          <div className="space-y-4">
            {/* поле текстового поиска */}
            <div className="space-y-1">
              <label className="text-sm font-bold block">Поиск по описанию:</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40"><PixelIcon.Search /></div>
                <input 
                  type="text" 
                  className="w-full border border-black p-2 pl-9 bg-white focus:bg-[#E0F2FE] outline-none transition-colors" 
                  placeholder="поиск..."
                  value={filters.search} 
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })} 
                />
              </div>
            </div>

            {/* выбор производителя */}
            <div className="space-y-1">
              <label className="text-sm font-bold block">Производитель:</label>
              <select 
                className="w-full border border-black p-2 bg-white cursor-pointer focus:bg-[#E0F2FE] outline-none"
                value={filters.manufacturer} 
                onChange={(e) => onFiltersChange({ ...filters, manufacturer: e.target.value })}
              >
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "Все производители" : m}
                  </option>
                ))}
              </select>
            </div>

            {/* фильтр по максимальной цене */}
            <div className="space-y-1">
              <label className="text-sm font-bold block">Цена до:</label>
              <input 
                type="number" 
                className="w-full border border-black p-2 bg-white focus:bg-[#E0F2FE] outline-none" 
                value={filters.maxPrice} 
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })} 
              />
            </div>

            {/* параметры сортировки */}
            <div className="space-y-1">
              <label className="text-sm font-bold block">Сортировка:</label>
              <select 
                className="w-full border border-black p-2 bg-white cursor-pointer focus:bg-[#E0F2FE] outline-none"
                value={filters.sortBy} 
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              >
                <option value="name">По названию</option>
                <option value="supplier">По поставщику</option>
                <option value="price">По возрастанию цены</option>
                <option value="price_desc">По убыванию цены</option>
              </select>
            </div>

            {/* дополнительные фильтры-флаги */}
            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 border-2 border-black rounded-none appearance-none checked:bg-black relative after:content-['✓'] after:absolute after:text-white after:hidden checked:after:block after:left-0.5 after:-top-0.5"
                    checked={filters.onlyDiscounted} 
                    onChange={(e) => onFiltersChange({ ...filters, onlyDiscounted: e.target.checked })} 
                />
                <span className="text-sm font-bold group-hover:underline">Только со скидкой</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4 border-2 border-black rounded-none appearance-none checked:bg-black relative after:content-['✓'] after:absolute after:text-white after:hidden checked:after:block after:left-0.5 after:-top-0.5"
                    checked={filters.onlyInStock} 
                    onChange={(e) => onFiltersChange({ ...filters, onlyInStock: e.target.checked })} 
                />
                <span className="text-sm font-bold group-hover:underline">Только в наличии</span>
              </label>
            </div>

            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFiltersChange(defaultFilters)}
                className="w-full py-2 border border-black hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold flex items-center justify-center gap-2"
            >
              <PixelIcon.Refresh />
              Сбросить фильтры
            </motion.button>
          </div>
        </motion.div>

        {/* основной список товаров */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
                />
                <div className="text-2xl font-bold uppercase">загрузка...</div>
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-black p-10 sm:p-20 text-center"
            >
                <p className="text-xl sm:text-2xl font-bold uppercase mb-2">Товары не найдены</p>
                <p className="opacity-60">измените параметры фильтрации</p>
                <button 
                  onClick={() => onFiltersChange(defaultFilters)}
                  className="mt-6 px-6 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase"
                >
                  сбросить фильтры
                </button>
            </motion.div>
          ) : (
            <motion.div layout className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <ProductCard
                    key={product.article}
                    product={product}
                    index={index}
                    onOrder={onOrder}
                    onOpen={() => onProduct(product.article)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
