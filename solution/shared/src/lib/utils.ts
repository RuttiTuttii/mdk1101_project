import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ApiProduct, type Product, type Route } from "../types";

// объединение классов tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// маппинг данных продукта из api во внутренний формат
export function mapApiProduct(item: ApiProduct): Product {
  return {
    article: item.article,
    name: item.name,
    description: item.description,
    manufacturer: item.manufacturer,
    supplier: item.supplier,
    category: item.category,
    unit: item.unit,
    price: Number(item.price),
    discountPercent: item.discount_percent,
    stockCount: item.stock_count,
    imagePath: item.image_path ?? null,
  };
}

// разбор текущего маршрута из хеша url
export function parseRoute(hash: string): Route {
  const cleaned = hash.replace(/^#\/?/, "");
  const parts = cleaned.split("/").filter(Boolean);
  const page = parts[0] ? decodeURIComponent(parts[0]) : "";
  
  if (page === "login") return { name: "login" };
  if (page === "register") return { name: "register" };
  if (page === "orders") return { name: "orders" };
  if (page === "product" && parts[1]) {
    return { name: "product", article: decodeURIComponent(parts[1]) };
  }
  return { name: "catalog" };
}

// формирование хеша url для навигации
export function routeToHash(route: Route): string {
  if (route.name === "product") return `#/product/${encodeURIComponent(route.article)}`;
  return `#/${route.name}`;
}

// форматирование числовых значений валюты
export function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
