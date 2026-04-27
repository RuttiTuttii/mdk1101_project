import type { CatalogFilters, Product, SortKey } from "./types";

// расчет стоимости товара с учетом текущей скидки
export function discountedPrice(product: Product) {
  return Math.round(product.price * (1 - product.discountPercent / 100) * 100) / 100;
}

// фильтрация и сортировка списка товаров по заданным критериям
export function filterCatalog(products: Product[], filters: CatalogFilters) {
  const query = filters.search.trim().toLowerCase();
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;

  return [...products]
    .filter((product) => (query ? product.description.toLowerCase().includes(query) : true))
    .filter((product) =>
      filters.manufacturer === "all" ? true : product.manufacturer === filters.manufacturer,
    )
    .filter((product) =>
      maxPrice !== undefined && !Number.isNaN(maxPrice)
        ? discountedPrice(product) <= maxPrice
        : true,
    )
    .filter((product) => (filters.onlyDiscounted ? product.discountPercent > 0 : true))
    .filter((product) => (filters.onlyInStock ? product.stockCount > 0 : true))
    .sort((a, b) => compareProducts(a, b, filters.sortBy));
}

// функция сравнения товаров для сортировки
function compareProducts(a: Product, b: Product, sortBy: SortKey) {
  if (sortBy === "supplier") {
    return a.supplier.localeCompare(b.supplier);
  }
  if (sortBy === "price") {
    return discountedPrice(a) - discountedPrice(b);
  }
  if (sortBy === "price_desc") {
    return discountedPrice(b) - discountedPrice(a);
  }
  return a.name.localeCompare(b.name);
}

// формирование списка уникальных производителей
export function uniqueManufacturers(products: Product[]) {
  return ["all", ...new Set(products.map((product) => product.manufacturer))];
}

// сбор статистических данных по списку товаров
export function buildSummary(products: Product[]) {
  return {
    total: products.length,
    discounted: products.filter((product) => product.discountPercent > 0).length,
    inStock: products.filter((product) => product.stockCount > 0).length,
    featured: products.filter((product) => product.discountPercent > 15).length,
    manufacturers: new Set(products.map((product) => product.manufacturer)).size,
  };
}
