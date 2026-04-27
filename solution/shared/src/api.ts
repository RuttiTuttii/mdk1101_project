import type { ApiOrder, ApiProduct, AuthSession, CatalogFilters, Role } from "@shared/types";

// базовый url для запросов к апи
const API_BASE = import.meta.env.VITE_API_URL ?? "";

type RegisterPayload = {
  full_name: string;
  login: string;
  password: string;
  role?: Role;
};

type LoginPayload = {
  login: string;
  password: string;
};

type CreateOrderPayload = {
  items: { article: string; quantity: number }[];
};

type UpdateOrderPayload = {
  status?: string;
  delivery_date?: string;
};

// универсальная функция для выполнения http-запросов
async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  // обработка ошибок ответа сервера
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // игнорируем ошибки парсинга тела при ошибке
    }
    throw new Error(detail);
  }

  // возврат пустого значения для 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// преобразование данных авторизации в формат сессии
export function toSession(payload: {
  access_token: string;
  login: string;
  full_name: string;
  role: Role;
}): AuthSession {
  return {
    token: payload.access_token,
    login: payload.login,
    fullName: payload.full_name,
    role: payload.role,
  };
}

// авторизация пользователя
export async function apiLogin(payload: LoginPayload): Promise<AuthSession> {
  const data = await request<{
    access_token: string;
    login: string;
    full_name: string;
    role: Role;
  }>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  return toSession(data);
}

// регистрация нового пользователя
export async function apiRegister(payload: RegisterPayload): Promise<AuthSession> {
  const data = await request<{
    access_token: string;
    login: string;
    full_name: string;
    role: Role;
  }>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  return toSession(data);
}

// получение данных текущего пользователя
export async function apiMe(token: string) {
  return request<{ login: string; full_name: string; role: Role }>("/auth/me", {}, token);
}

// получение списка товаров с фильтрацией
export async function apiCatalog(filters: CatalogFilters): Promise<ApiProduct[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.manufacturer) params.set("manufacturer", filters.manufacturer);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);
  if (filters.onlyDiscounted) params.set("only_discounted", "true");
  if (filters.onlyInStock) params.set("only_in_stock", "true");
  if (filters.sortBy) params.set("sort_by", filters.sortBy);
  return request<ApiProduct[]>(`/catalog?${params.toString()}`);
}

// получение списка всех доступных производителей
export async function apiManufacturers(): Promise<string[]> {
  return request<string[]>("/manufacturers");
}

// получение детальной информации о конкретном товаре
export async function apiProduct(article: string): Promise<ApiProduct> {
  return request<ApiProduct>(`/products/${encodeURIComponent(article)}`);
}

// получение списка заказов текущего пользователя
export async function apiOrders(token: string): Promise<ApiOrder[]> {
  return request<ApiOrder[]>("/orders/me", {}, token);
}

// получение полного списка заказов (для администраторов)
export async function apiAllOrders(token: string): Promise<ApiOrder[]> {
  return request<ApiOrder[]>("/orders", {}, token);
}

// создание нового заказа
export async function apiCreateOrder(
  token: string,
  payload: CreateOrderPayload,
): Promise<ApiOrder> {
  return request<ApiOrder>("/orders", { method: "POST", body: JSON.stringify(payload) }, token);
}

// обновление статуса или параметров существующего заказа
export async function apiUpdateOrder(
  token: string,
  number: number,
  payload: UpdateOrderPayload,
): Promise<ApiOrder> {
  return request<ApiOrder>(`/orders/${number}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
}
