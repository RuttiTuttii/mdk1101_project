import type { ApiOrder, ApiPaginatedResponse, ApiProduct, AuthSession, CatalogFilters, Role } from "@shared/types";

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
  const isFormData = options.body instanceof FormData;
  
  // формируем заголовки, если это formData — браузер сам поставит boundary
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as any ?? {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // удаляем заголовок если он был передан как undefined или если это formData
  if (headers["Content-Type"] === "undefined" || isFormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
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

  // возврат пустого значения для 204 no content
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

// получение списка товаров с фильтрацией и пагинацией
export async function apiCatalog(filters: CatalogFilters): Promise<ApiPaginatedResponse<ApiProduct>> {
  const params = new URLSearchParams();
  
  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }
  
  if (filters.manufacturer && filters.manufacturer !== "all") {
    params.set("manufacturer", filters.manufacturer);
  }
  
  if (filters.maxPrice && filters.maxPrice.toString().trim() !== "") {
    params.set("max_price", filters.maxPrice.toString().trim());
  }
  
  if (filters.onlyDiscounted) params.set("only_discounted", "true");
  if (filters.onlyInStock) params.set("only_in_stock", "true");
  if (filters.sortBy) params.set("sort_by", filters.sortBy);
  
  // всегда передаем страницу и размер для надежности
  params.set("page", (filters.page || 1).toString());
  params.set("page_size", (filters.pageSize || 10).toString());
  
  // добавляем метку времени для обхода кеша браузера
  params.set("_t", Date.now().toString());
  
  const url = `/catalog?${params.toString()}`;
  return request<ApiPaginatedResponse<ApiProduct>>(url);
}

// получение списка всех доступных производителей
export async function apiManufacturers(): Promise<string[]> {
  return request<string[]>("/manufacturers");
}

// получение детальной информации о конкретном товаре
export async function apiProduct(article: string): Promise<ApiProduct> {
  // если артикул уже похож на закодированный (содержит %), не кодируем его второй раз
  const encodedArticle = article.includes("%") ? article : encodeURIComponent(article);
  return request<ApiProduct>(`/products/${encodedArticle}`);
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

// парсинг файла (csv/xlsx) для предпросмотра импорта
export async function apiAdminParseFile(token: string, file: File): Promise<ApiProduct[]> {
  const formData = new FormData();
  formData.append("file", file);
  
  return request<ApiProduct[]>("/admin/parse-file", {
    method: "POST",
    body: formData,
  }, token);
}

// импорт выбранных товаров в базу данных (admin only)
export async function apiAdminImportProducts(token: string, products: any[]): Promise<{ status: string; count: string }> {
  return request<{ status: string; count: string }>("/admin/import-products", {
    method: "POST",
    body: JSON.stringify(products)
  }, token);
}

// создание нового товара (admin/manager)
export async function apiCreateProduct(token: string, product: any): Promise<ApiProduct> {
  return request<ApiProduct>("/products", {
    method: "POST",
    body: JSON.stringify(product),
  }, token);
}

// обновление существующего товара (admin/manager)
export async function apiUpdateProduct(token: string, article: string, product: any): Promise<ApiProduct> {
  return request<ApiProduct>(`/products/${article}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  }, token);
}

// удаление товара (admin/manager)
export async function apiDeleteProduct(token: string, article: string): Promise<void> {
  return request<void>(`/products/${article}`, { method: "DELETE" }, token);
}
