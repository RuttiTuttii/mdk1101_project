export type SortKey = "name" | "supplier" | "price" | "price_desc";

export type Product = {
  article: string;
  name: string;
  description: string;
  manufacturer: string;
  supplier: string;
  category: string;
  unit: string;
  price: number;
  discountPercent: number;
  stockCount: number;
  imagePath?: string | null;
};

export type CatalogFilters = {
  search: string;
  manufacturer: string;
  maxPrice: string;
  onlyDiscounted: boolean;
  onlyInStock: boolean;
  sortBy: SortKey;
};

export type Role = "admin" | "manager" | "client";

export type AuthSession = {
  token: string;
  login: string;
  fullName: string;
  role: Role;
};

export type ApiProduct = {
  article: string;
  name: string;
  description: string;
  manufacturer: string;
  supplier: string;
  category: string;
  unit: string;
  price: string | number;
  discount_percent: number;
  stock_count: number;
  image_path?: string | null;
  discounted_price: string | number;
  has_discount: boolean;
  in_stock: boolean;
};

export type ApiOrderItem = {
  article: string;
  quantity: number;
  unit_price: string | number;
  total: string | number;
};

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

export type Route =
  | { name: "catalog" }
  | { name: "login" }
  | { name: "register" }
  | { name: "orders" }
  | { name: "product"; article: string };
