import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type ApiProduct, type Product, type Route } from "../types";

/**
 * тут лежат всякие полезные штуки, которые нужны везде понемногу
 * чисто утилитарный код, чтобы не засорять компоненты
 */

// стандартная утилита для объединения классов tailwind
// без неё компоненты shadcn развалятся, так что возвращаем на место
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// превращаем ответ от апи в удобный для фронта объект
// приводим типы к нормальному виду, чтобы не гадать где строка а где число
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

// достаем текущий роут из хеша ссылки
// простенький парсер, чтобы понимать на какой мы странице
export function parseRoute(hash: string): Route {
  const cleaned = hash.replace(/^#\/?/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts[0] === "login") return { name: "login" };
  if (parts[0] === "register") return { name: "register" };
  if (parts[0] === "orders") return { name: "orders" };
  if (parts[0] === "product" && parts[1]) return { name: "product", article: parts[1] };
  return { name: "catalog" };
}

// генерим хеш для перехода по страницам
// чтобы везде одинаково ссылки формировались
export function routeToHash(route: Route): string {
  if (route.name === "product") return `#/product/${route.article}`;
  return `#/${route.name}`;
}

// форматируем денежки в красивый вид с пробелами
// типа 10 000 вместо 10000
export function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
