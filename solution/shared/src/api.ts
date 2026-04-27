import type { ApiOrder, ApiProduct, AuthSession, CatalogFilters, Role } from "@shared/types";

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

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

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

export async function apiLogin(payload: LoginPayload): Promise<AuthSession> {
  const data = await request<{
    access_token: string;
    login: string;
    full_name: string;
    role: Role;
  }>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  return toSession(data);
}

export async function apiRegister(payload: RegisterPayload): Promise<AuthSession> {
  const data = await request<{
    access_token: string;
    login: string;
    full_name: string;
    role: Role;
  }>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  return toSession(data);
}

export async function apiMe(token: string) {
  return request<{ login: string; full_name: string; role: Role }>("/auth/me", {}, token);
}

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

export async function apiManufacturers(): Promise<string[]> {
  return request<string[]>("/manufacturers");
}

export async function apiProduct(article: string): Promise<ApiProduct> {
  return request<ApiProduct>(`/products/${encodeURIComponent(article)}`);
}

export async function apiOrders(token: string): Promise<ApiOrder[]> {
  return request<ApiOrder[]>("/orders/me", {}, token);
}

export async function apiAllOrders(token: string): Promise<ApiOrder[]> {
  return request<ApiOrder[]>("/orders", {}, token);
}

export async function apiCreateOrder(
  token: string,
  payload: CreateOrderPayload,
): Promise<ApiOrder> {
  return request<ApiOrder>("/orders", { method: "POST", body: JSON.stringify(payload) }, token);
}

export async function apiUpdateOrder(
  token: string,
  number: number,
  payload: UpdateOrderPayload,
): Promise<ApiOrder> {
  return request<ApiOrder>(`/orders/${number}`, { method: "PATCH", body: JSON.stringify(payload) }, token);
}
