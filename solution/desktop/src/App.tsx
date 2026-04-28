import { useState, useEffect, useMemo, type FormEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { motion, AnimatePresence } from "framer-motion";
import { ProductEditPage } from "@shared/pages/Product/ProductEditPage";
import { mapApiProduct, parseRoute, routeToHash } from "@shared/lib/utils";
import {
  apiAllOrders,
  apiCatalog,
  apiCreateOrder,
  apiLogin,
  apiManufacturers,
  apiMe,
  apiOrders,
  apiProduct,
  apiRegister,
  apiDeleteProduct,
  apiUpdateOrder,
} from "@shared/api";
import { buildSummary } from "@shared/catalog";
import { CATALOG } from "@shared/data/catalog-data";
import { PixelIcon } from "@shared/components/Common/PixelIcon";
import type {
  ApiOrder,
  AuthSession,
  CatalogFilters,
  Product,
  Route,
  UpdateOrderPayload,
} from "@shared/types";

import { LoginPage } from "@shared/pages/Auth/LoginPage";
import { RegisterPage } from "@shared/pages/Auth/RegisterPage";
import { CatalogPage } from "@shared/pages/Catalog/CatalogPage";
import { OrdersPage } from "@shared/pages/Orders/OrdersPage";
import { AdminPage } from "@shared/pages/Admin/AdminPage";
import { ProductPage } from "@shared/pages/Product/ProductPage";

const STORAGE_KEY = "shoe-store.session";
const PENDING_ORDER_KEY = "shoe-store.pending-order";

const DEFAULT_FILTERS: CatalogFilters = {
  search: "",
  manufacturer: "all",
  maxPrice: "",
  onlyDiscounted: false,
  onlyInStock: false,
  sortBy: "name",
  page: 1,
  pageSize: 10,
};

const DEFAULT_LOGIN = { login: "", password: "" };
const DEFAULT_REGISTER = { fullName: "", login: "", password: "" };

/**
 * десктопная версия приложения.
 * отличается от web: кастомный тайтлбар (data-tauri-drag-region) и apiMe для валидации сессии.
 */
export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>(["all"]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState(DEFAULT_LOGIN);
  const [registerForm, setRegisterForm] = useState(DEFAULT_REGISTER);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // отслеживание изменений хеша для навигации
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
      setIsMenuOpen(false);
    };
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) window.location.hash = "#/catalog";
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // восстановление сессии из локального хранилища с валидацией через api
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as AuthSession;
      setAuth(parsed);
      apiMe(parsed.token)
        .then((me) => {
          setAuth({ token: parsed.token, login: me.login, fullName: me.full_name, role: me.role });
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          setAuth(null);
        });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // загрузка данных каталога и списка производителей
  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    setCatalogError(null);
    Promise.all([apiCatalog(catalogFilters), apiManufacturers()])
      .then(([response, manufacturerList]) => {
        if (!active) return;
        setProducts(response.items.map(mapApiProduct));
        setTotalItems(response.total);
        setManufacturers(["all", ...manufacturerList]);
      })
      .catch((e) => {
        console.error("API error, falling back to mock data", e);
        if (!active) return;
        setProducts(CATALOG);
        setTotalItems(CATALOG.length);
        setManufacturers(["all", ...new Set(CATALOG.map((p) => p.manufacturer))]);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => { active = false; };
  }, [catalogFilters]);

  // загрузка детальной информации о товаре
  useEffect(() => {
    if (route.name !== "product") {
      setSelectedProduct(null);
      return;
    }
    let active = true;
    apiProduct(route.article)
      .then((item) => {
        if (!active) return;
        setSelectedProduct(mapApiProduct(item));
      })
      .catch(() => {
        if (!active) return;
        const fallback = CATALOG.find((p) => p.article === route.article);
        if (fallback) setSelectedProduct(fallback);
      });
    return () => { active = false; };
  }, [route]);

  // загрузка списка заказов пользователя
  useEffect(() => {
    if (route.name !== "orders" || !auth) return;
    let active = true;
    setOrdersLoading(true);
    setOrdersError(null);
    const fetcher = (auth.role === "admin" || auth.role === "manager") ? apiAllOrders : apiOrders;
    fetcher(auth.token)
      .then((items) => {
        if (!active) return;
        setOrders(items);
      })
      .catch((err) => {
        if (active) setOrdersError(err instanceof Error ? err.message : "ошибка загрузки заказов");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => { active = false; };
  }, [route, auth]);

  const summary = useMemo(() => buildSummary(products), [products]);

  // обработчик авторизации пользователя
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setBusy(true);
      const session = await apiLogin(loginForm);
      setAuth(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setMessage(`${session.fullName}, добро пожаловать!`);
      const pending = sessionStorage.getItem(PENDING_ORDER_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_ORDER_KEY);
        await apiCreateOrder(session.token, { items: [{ article: pending, quantity: 1 }] });
        setMessage("заказ создан автоматически после входа.");
        navigate({ name: "orders" });
      } else {
        navigate({ name: "catalog" });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ошибка авторизации");
    } finally {
      setBusy(false);
    }
  }

  // обработчик регистрации нового пользователя
  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setBusy(true);
      const session = await apiRegister({ ...registerForm, full_name: registerForm.fullName });
      setAuth(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setMessage("регистрация успешно завершена");
      navigate({ name: "catalog" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ошибка при регистрации");
    } finally {
      setBusy(false);
    }
  }

  // создание нового заказа
  async function handleOrder(article: string) {
    if (!auth) {
      sessionStorage.setItem(PENDING_ORDER_KEY, article);
      setMessage("необходима авторизация для оформления заказа");
      navigate({ name: "login" });
      return;
    }
    try {
      setBusy(true);
      await apiCreateOrder(auth.token, { items: [{ article, quantity: 1 }] });
      setMessage("заказ успешно оформлен");
      navigate({ name: "orders" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ошибка оформления заказа");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProduct(article: string) {
    if (!auth) return;
    try {
      setBusy(true);
      await apiDeleteProduct(auth.token, article);
      setMessage("товар удален.");
      const response = await apiCatalog(catalogFilters);
      setProducts(response.items.map(mapApiProduct));
      setTotalItems(response.total);
      navigate({ name: "catalog" });
    } catch {
      setMessage("ошибка при удалении товара.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateOrderStatus(number: number, status: string, deliveryDate?: string) {
    if (!auth) return;
    try {
      setBusy(true);
      const payload: UpdateOrderPayload = { status };
      if (deliveryDate) payload.delivery_date = deliveryDate;
      await apiUpdateOrder(auth.token, number, payload);
      setMessage("заказ обновлен.");
      const list = auth.role === "client" ? await apiOrders(auth.token) : await apiAllOrders(auth.token);
      setOrders(list);
    } catch {
      setMessage("ошибка при обновлении заказа.");
    } finally {
      setBusy(false);
    }
  }

  function navigate(route: Route) {
    window.location.hash = routeToHash(route);
  }

  // выход пользователя из системы
  function handleLogout() {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(PENDING_ORDER_KEY);
    setOrders([]);
    setMessage("вы вышли из системы");
    navigate({ name: "catalog" });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Times New Roman', Times, serif", borderRadius: 0 }}>
      {/* кастомный тайтлбар — фиксированный, не скроллится с контентом */}
      <div
        data-tauri-drag-region
        className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between h-8 px-3 select-none border-b-2 border-black"
        style={{ backgroundColor: "#7FFF00" }}
      >
        {/* левая часть — заголовок */}
        <span className="text-[11px] font-black uppercase tracking-widest pointer-events-none" data-tauri-drag-region>ShoeStore Desktop</span>

        {/* кнопки управления окном */}
        <div className="flex items-center gap-0">
          {/* скрыть */}
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/20 transition-colors font-bold text-base leading-none"
            title="Свернуть"
          >
            <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
              <rect width="10" height="2" fill="currentColor" />
            </svg>
          </button>
          {/* развернуть / восстановить */}
          <button
            onClick={() => getCurrentWindow().toggleMaximize()}
            className="w-8 h-8 flex items-center justify-center hover:bg-black/20 transition-colors"
            title="Развернуть"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          {/* закрыть */}
          <button
            onClick={() => getCurrentWindow().close()}
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
            title="Закрыть"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="2" />
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* отступ под фиксированный тайтлбар (32px = h-8) */}
      <div style={{ height: 32 }} />

      {/* основной заголовок приложения с навигацией */}
      <header className="border-b-4 border-black bg-[#7FFF00] sticky top-8 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 sm:gap-6 cursor-pointer"
            onClick={() => navigate({ name: "catalog" })}
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-black p-1">
              <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none">Обувной Магазин</h1>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase opacity-80">официальное приложение</p>
            </div>
          </motion.div>

          {/* блок навигации для десктопных устройств */}
          <nav className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate({ name: "catalog" })} className="px-4 py-2 font-bold hover:underline uppercase text-sm">Каталог</button>
            <button onClick={() => navigate({ name: "orders" })} className="px-4 py-2 font-bold hover:underline uppercase text-sm">Заказы</button>
            {auth?.role === "admin" && (
              <button onClick={() => navigate({ name: "admin" })} className="px-4 py-2 font-bold hover:underline uppercase text-sm text-red-600">Админ</button>
            )}
            {auth ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l-2 border-black">
                <div className="text-right">
                  <p className="text-sm font-bold leading-tight">{auth.fullName}</p>
                  <p className="text-[10px] uppercase font-bold opacity-60">{auth.role}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  onClick={handleLogout}
                  className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white"
                >
                  <PixelIcon.Logout />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{
                  scale: 1.05,
                  translateY: -2,
                  translateX: -2,
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate({ name: "login" })}
                className="ml-4 px-6 py-2 border-2 border-black bg-[#00FA9A] font-black uppercase hover:bg-black hover:text-white transition-all text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Войти
              </motion.button>
            )}
          </nav>

          {/* кнопка управления мобильным меню */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <PixelIcon.Close /> : <PixelIcon.Menu />}
          </button>
        </div>

        {/* выпадающее меню для мобильных устройств */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t-2 border-black overflow-hidden"
            >
              <nav className="flex flex-col gap-4 mt-8 px-4 pb-8">
                <button onClick={() => navigate({ name: "catalog" })} className="text-left py-2 font-black uppercase border-b border-black/10">Каталог</button>
                {auth && (
                  <button onClick={() => navigate({ name: "orders" })} className="text-left py-2 font-black uppercase border-b border-black/10">Заказы</button>
                )}
                {auth?.role === "admin" && (
                  <button onClick={() => navigate({ name: "admin" })} className="text-left py-2 font-black uppercase border-b border-black/10 text-red-600">Админ-панель</button>
                )}
                {!auth ? (
                  <button onClick={() => navigate({ name: "login" })} className="text-left py-2 font-black uppercase border-b border-black/10">Вход</button>
                ) : (
                  <button onClick={handleLogout} className="text-left py-2 font-black uppercase border-b border-black/10 text-red-600">Выход</button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* система всплывающих системных уведомлений */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-24 left-0 right-0 z-[100] max-w-7xl mx-auto px-4"
          >
            <div className="border-4 border-black p-4 bg-[#00FA9A] flex items-center justify-between font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <span className="flex-grow">{message}</span>
              <button onClick={() => setMessage(null)} className="ml-4 hover:scale-125 transition-transform"><PixelIcon.Close /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.name + ("article" in route ? route.article ?? "" : "")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* подвал сайта с правовой информацией */}
      <footer className="border-t-4 border-black bg-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block w-12 h-12 border-2 border-black p-2 mb-6 grayscale opacity-30">
            <img src="/favicon.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <p className="font-bold uppercase tracking-widest text-sm">© 2026 Обувной Магазин. Все права защищены.</p>
          <p className="text-[10px] opacity-40 mt-4 uppercase font-bold">информационная система магазина обуви</p>
        </div>
      </footer>
    </div>
  );

  function renderPage() {
    switch (route.name) {
      case "login":
        return <LoginPage busy={busy} loginForm={loginForm} auth={auth} onLoginChange={setLoginForm} onLoginSubmit={handleLogin} onNavigate={navigate} />;
      case "register":
        return <RegisterPage busy={busy} registerForm={registerForm} onRegisterChange={setRegisterForm} onRegisterSubmit={handleRegister} onNavigate={navigate} />;
      case "orders":
        return <OrdersPage auth={auth} orders={orders} loading={ordersLoading} error={ordersError} onGoLogin={() => navigate({ name: "login" })} onRefresh={() => {}} onUpdateStatus={handleUpdateOrderStatus} />;
      case "admin":
        return <AdminPage auth={auth} onNavigate={navigate} setMessage={setMessage} />;
      case "product":
        return (
          <ProductPage
            auth={auth}
            product={selectedProduct}
            loading={catalogLoading && !selectedProduct}
            error={catalogError}
            onOrder={handleOrder}
            onEdit={() => navigate({ name: "product-edit", article: selectedProduct?.article ?? undefined })}
            onDelete={handleDeleteProduct}
            onGoLogin={() => navigate({ name: "login" })}
            onBack={() => navigate({ name: "catalog" })}
          />
        );
      case "product-edit":
        return (
          <ProductEditPage
            auth={auth}
            product={route.article ? (products.find(p => p.article === route.article) || selectedProduct) : null}
            onSave={() => {
              apiCatalog(catalogFilters).then(response => setProducts(response.items.map(mapApiProduct)));
              navigate({ name: "catalog" });
            }}
            onBack={() => navigate({ name: "catalog" })}
          />
        );
      default:
        return (
          <CatalogPage
            auth={auth}
            summary={summary}
            products={products}
            manufacturers={manufacturers}
            filters={catalogFilters}
            loading={catalogLoading}
            error={catalogError}
            totalItems={totalItems}
            onFiltersChange={setCatalogFilters}
            onOrder={handleOrder}
            onProduct={(article) => navigate({ name: "product", article })}
            onAddProduct={() => navigate({ name: "product-edit" })}
            defaultFilters={DEFAULT_FILTERS}
          />
        );
    }
  }
}
