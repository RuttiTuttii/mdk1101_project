import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Tag, Package, Star, Filter, Search, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { ProductCard } from "@shared/components/Catalog/ProductCard";
import { type CatalogFilters, type Product } from "@shared/types";
import { buildSummary } from "@shared/catalog";



/**
 * главная страница каталога
 * тут и поиск, и фильтры, и сама витрина товаров
 */

interface CatalogPageProps {
  featured?: Product;
  summary: ReturnType<typeof buildSummary>;
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
      {/* Шапка с названием и логотипом по ТЗ */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-black flex items-center justify-center p-2">
                <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-tighter">Список товаров</h1>
                <p className="text-sm opacity-70">Просмотр и поиск товаров в каталоге</p>
            </div>
        </div>
        
        <div className="text-right">
            <div className="flex gap-4 text-xs font-bold uppercase">
                <span>Товаров: {summary.total}</span>
                <span>Брендов: {summary.manufacturers}</span>
            </div>
        </div>
      </div>

      {/* Фильтры и контент */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Панель фильтров слева */}
        <div className="border-2 border-black p-6 space-y-6 bg-[#FFFFFF]">
          <h2 className="text-xl font-bold border-b border-black pb-2">Фильтрация</h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold block">Поиск по описанию:</label>
              <input 
                type="text" 
                className="w-full border border-black p-2 bg-white" 
                placeholder="введите текст..."
                value={filters.search} 
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold block">Производитель:</label>
              <select 
                className="w-full border border-black p-2 bg-white"
                value={filters.manufacturer} 
                onValueChange={(v) => onFiltersChange({ ...filters, manufacturer: v })}
                onChange={(e) => onFiltersChange({ ...filters, manufacturer: e.target.value })}
              >
                {manufacturers.map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "Все производители" : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold block">Цена до:</label>
              <input 
                type="number" 
                className="w-full border border-black p-2 bg-white" 
                value={filters.maxPrice} 
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })} 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold block">Сортировка:</label>
              <select 
                className="w-full border border-black p-2 bg-white"
                value={filters.sortBy} 
                onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as any })}
              >
                <option value="name">По названию</option>
                <option value="supplier">По поставщику</option>
                <option value="price">По возрастанию цены</option>
                <option value="price_desc">По убыванию цены</option>
              </select>
            </div>

            <div className="space-y-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={filters.onlyDiscounted} 
                    onChange={(e) => onFiltersChange({ ...filters, onlyDiscounted: e.target.checked })} 
                />
                <span className="text-sm font-bold">Только со скидкой</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    className="w-4 h-4"
                    checked={filters.onlyInStock} 
                    onChange={(e) => onFiltersChange({ ...filters, onlyInStock: e.target.checked })} 
                />
                <span className="text-sm font-bold">Только в наличии</span>
              </label>
            </div>

            <button 
                onClick={() => onFiltersChange(defaultFilters)}
                className="w-full py-2 border border-black hover:bg-black hover:text-white transition-colors uppercase text-xs font-bold"
            >
              Сбросить все
            </button>
          </div>
        </div>

        {/* Список товаров */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-2xl font-bold animate-pulse">Загрузка данных...</div>
          ) : products.length === 0 ? (
            <div className="border-2 border-black p-20 text-center">
                <p className="text-2xl font-bold">Товары не найдены</p>
                <p>Измените параметры поиска</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((product, index) => (
                <ProductCard
                  key={product.article}
                  product={product}
                  index={index}
                  onOrder={onOrder}
                  onOpen={() => onProduct(product.article)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// иконка магазина, вынес чтобы не импортировать лишний раз
function StoreIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
  );
}
