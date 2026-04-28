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
    maxDiscountPercent: item.max_discount_percent,
    discountPercent: item.discount_percent,
    stockCount: item.stock_count,
    imagePath: item.image_path ?? null,
  };
}

// разбор текущего маршрута из хеша url
export function parseRoute(hash: string): Route {
  const cleaned = hash.replace(/^#\/?/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts[0] === "login") return { name: "login" };
  if (parts[0] === "register") return { name: "register" };
  if (parts[0] === "orders") return { name: "orders" };
  if (parts[0] === "admin") return { name: "admin" };
  if (parts[0] === "product" && parts[1]) {
    if (parts[2] === "edit") return { name: "product-edit", article: parts[1] };
    return { name: "product", article: parts[1] };
  }
  if (parts[0] === "product-add") return { name: "product-edit" };
  return { name: "catalog" };
}

export function routeToHash(route: Route): string {
  if (route.name === "product") return `#/product/${route.article}`;
  if (route.name === "product-edit") {
    return route.article ? `#/product/${route.article}/edit` : `#/product-add`;
  }
  return `#/${route.name}`;
}

// форматирование числовых значений валюты
export function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
