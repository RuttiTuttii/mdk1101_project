// доступные ключи для сортировки товаров
export type SortKey = "name" | "supplier" | "price" | "price_desc";

// модель данных товара во внутреннем формате приложения
export type Product = {
  article: string;
  name: string;
  description: string;
  manufacturer: string;
  supplier: string;
  category: string;
  unit: string;
  price: number;
  maxDiscountPercent: number;
  discountPercent: number;
  stockCount: number;
  imagePath?: string | null;
};

// структура фильтров для каталога продукции
export type CatalogFilters = {
  search: string;
  manufacturer: string;
  maxPrice: string;
  onlyDiscounted: boolean;
  onlyInStock: boolean;
  sortBy: SortKey;
  page: number;
  pageSize: number;
};

export type ApiPaginatedResponse<T> = {
    items: T[];
    total: number;
    page: number;
    page_size: number;
};

// перечень ролей пользователей в системе
export type Role = "admin" | "manager" | "client";

// данные текущей авторизованной сессии
export type AuthSession = {
  token: string;
  login: string;
  fullName: string;
  role: Role;
};

// модель данных товара, возвращаемая сервером апи
export type ApiProduct = {
  article: string;
  name: string;
  description: string;
  manufacturer: string;
  supplier: string;
  category: string;
  unit: string;
  price: string | number;
  max_discount_percent: number;
  discount_percent: number;
  stock_count: number;
  image_path?: string | null;
  discounted_price: string | number;
  has_discount: boolean;
  in_stock: boolean;
};

// модель позиции в составе заказа
export type ApiOrderItem = {
  article: string;
  quantity: number;
  unit_price: string | number;
  total: string | number;
};

// модель заказа, возвращаемая сервером апи
export type ApiOrder = {
  number: number;
  user_login: string;
  user_full_name: string;
  created_at: string;
  delivery_date: string;
  pickup_code: number;
  status: string;
  total: string | number;
  items: ApiOrderItem[];
};

export type UpdateOrderPayload = {
  status?: string;
  delivery_date?: string;
};

// перечисление возможных маршрутов навигации фронтенда
export type Route =
  | { name: "catalog" }
  | { name: "login" }
  | { name: "register" }
  | { name: "orders" }
  | { name: "admin" }
  | { name: "product"; article: string }
  | { name: "product-edit"; article?: string };
