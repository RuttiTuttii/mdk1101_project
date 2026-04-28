import { motion, AnimatePresence } from "framer-motion";
import { PixelIcon } from "../../components/Common/PixelIcon";
import { PixelCheckbox } from "../../components/Common/PixelCheckbox";
import { ProductCard } from "../../components/Catalog/ProductCard";
import { type AuthSession, type CatalogFilters, type Product } from "../../types";

interface CatalogPageProps {
  auth: AuthSession | null;
  summary: { total: number; manufacturers: number };
  products: Product[];
  manufacturers: string[];
  filters: CatalogFilters;
  loading: boolean;
  error: string | null;
  onFiltersChange: (filters: CatalogFilters) => void;
  onOrder: (article: string) => Promise<void>;
  onProduct: (article: string) => void;
  onAddProduct: () => void;
  defaultFilters: CatalogFilters;
  totalItems?: number;
}

export function CatalogPage({
  auth,
  summary,
  products,
  manufacturers,
  filters,
  loading,
  error,
  onFiltersChange,
  onOrder,
  onProduct,
  onAddProduct,
  defaultFilters,
  totalItems = 0,
}: CatalogPageProps) {
  const totalPages = Math.ceil(totalItems / (filters.pageSize || 10));
  return (
    <div className="space-y-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      {/* заголовок страницы и общая статистика */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-black pb-4 gap-4"
      >
        <div className="flex items-center gap-4">
            <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tighter">список товаров</h1>
                <p className="text-xs sm:text-sm opacity-70">каталог доступной продукции в системе</p>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            {(auth?.role === "admin" || auth?.role === "manager") && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onAddProduct}
                    className="px-6 py-2 border-4 border-black bg-[#7FFF00] font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                >
                    <PixelIcon.Plus /> добавить товар
                </motion.button>
            )}
            <div className="text-right flex sm:flex-col gap-4 sm:gap-0">
                <div className="flex gap-4 text-[10px] sm:text-xs font-bold uppercase">
                    <span>товаров: {totalItems}</span>
                    <span>брендов: {manufacturers.length > 1 ? manufacturers.length - 1 : 0}</span>
                </div>
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
            <h2 className="text-xl font-bold uppercase tracking-tighter">фильтрация</h2>
            <PixelIcon.Filter />
          </div>
          
          <div className="space-y-4">
            {/* поле текстового поиска */}
            <div className="space-y-1">
              <label className="text-sm font-bold block lowercase">поиск по описанию:</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40"><PixelIcon.Search /></div>
                <input 
                  type="text" 
                  className="w-full border border-black p-2 pl-9 bg-white focus:bg-[#E0F2FE] outline-none transition-colors" 
                  placeholder="что ищем?..."
                  value={filters.search} 
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })} 
                />
              </div>
            </div>

            {/* выбор производителя */}
            <div className="space-y-1">
              <label className="text-sm font-bold block lowercase">производитель:</label>
              <select 
                className="w-full border border-black p-2 bg-white cursor-pointer focus:bg-[#E0F2FE] outline-none"
                value={filters.manufacturer} 
                onChange={(e) => onFiltersChange({ ...filters, manufacturer: e.target.value })}
              >
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "все производители" : m}
                  </option>
                ))}
              </select>
            </div>

            {/* фильтр по максимальной цене */}
            <div className="space-y-1">
              <label className="text-sm font-bold block lowercase">цена до:</label>
              <input 
                type="number" 
                className="w-full border border-black p-2 bg-white focus:bg-[#E0F2FE] outline-none" 
                value={filters.maxPrice} 
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })} 
              />
            </div>

            {/* параметры сортировки */}
            <div className="space-y-1">
              <label className="text-sm font-bold block lowercase">сортировка:</label>
              <select 
                className="w-full border border-black p-2 bg-white cursor-pointer focus:bg-[#E0F2FE] outline-none"
                value={filters.sortBy} 
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              >
                <option value="name">по названию</option>
                <option value="supplier">по поставщику</option>
                <option value="price">по возрастанию цены</option>
                <option value="price_desc">по убыванию цены</option>
              </select>
            </div>

            {/* дополнительные фильтры-флаги */}
            <div className="space-y-3 pt-4">
              <PixelCheckbox 
                checked={filters.onlyDiscounted} 
                onChange={(checked) => onFiltersChange({ ...filters, onlyDiscounted: checked })}
                label="только со скидкой"
              />
              <PixelCheckbox 
                checked={filters.onlyInStock} 
                onChange={(checked) => onFiltersChange({ ...filters, onlyInStock: checked })}
                label="только в наличии"
              />
            </div>

            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onFiltersChange(defaultFilters)}
                className="w-full py-2 border-2 border-black hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold flex items-center justify-center gap-2"
            >
              <PixelIcon.Refresh />
              сбросить фильтры
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
              className="border-4 border-black p-10 sm:p-20 text-center bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
                <p className="text-xl sm:text-2xl font-bold uppercase mb-2 tracking-tighter">товары не найдены</p>
                <p className="opacity-60 lowercase">попробуйте изменить параметры фильтрации или поиска</p>
                <button 
                  onClick={() => onFiltersChange(defaultFilters)}
                  className="mt-6 px-8 py-3 border-4 border-black bg-[#7FFF00] hover:bg-black hover:text-white transition-colors font-bold uppercase text-sm"
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

          {/* пагинация */}
          {!loading && products.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-4 border-t-4 border-black">
              <button
                onClick={() => {
                  onFiltersChange({ ...filters, page: filters.page - 1 });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={filters.page <= 1}
                className="px-6 py-2 border-2 border-black bg-white font-bold uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
              >
                назад
              </button>
              
              <div className="font-bold uppercase tracking-tighter text-sm">
                страница {filters.page} из {totalPages}
              </div>

              <button
                onClick={() => {
                  onFiltersChange({ ...filters, page: filters.page + 1 });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={filters.page >= totalPages}
                className="px-6 py-2 border-2 border-black bg-white font-bold uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-colors"
              >
                вперед
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
