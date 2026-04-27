import { motion, AnimatePresence } from "framer-motion";
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
  apiUpdateOrder,
} from "@shared/api";
import { buildSummary } from "@shared/catalog";

import { CATALOG } from "@shared/data/catalog-data";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { TooltipProvider } from "./components/ui/tooltip";
import {
  ShoppingBag,
  Package,
  User,
  LogOut,
  Store,
  Menu,
  X,
  Tag,
  Minus,
  Square,
} from "lucide-react";
import type {
  ApiOrder,
  AuthSession,
  CatalogFilters,
  Product,
  Route,
} from "@shared/types";

// импортируем наши новенькие страницы и утилиты из общей папки
import { LoginPage } from "@shared/pages/Auth/LoginPage";
import { RegisterPage } from "@shared/pages/Auth/RegisterPage";
import { CatalogPage } from "@shared/pages/Catalog/CatalogPage";
import { OrdersPage } from "@shared/pages/Orders/OrdersPage";
import { ProductPage } from "@shared/pages/Product/ProductPage";
import { mapApiProduct, parseRoute, routeToHash } from "@shared/lib/utils";


/**
 * десктопная версия приложения
 * тут у нас кастомный тайтлбар сверху, чтобы выглядело как нативное окно
 */

const STORAGE_KEY = "shoe-store.session";
const PENDING_ORDER_KEY = "shoe-store.pending-order";

const DEFAULT_FILTERS: CatalogFilters = {

  search: "",
  manufacturer: "all",
  maxPrice: "",
  onlyDiscounted: false,
  onlyInStock: false,
  sortBy: "name",
};

const DEFAULT_LOGIN = { login: "", password: "" };
const DEFAULT_REGISTER = { fullName: "", login: "", password: "" };

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<string[]>(["all"]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState(DEFAULT_LOGIN);
  const [registerForm, setRegisterForm] = useState(DEFAULT_REGISTER);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // стандартные эффекты как в вебе
  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) {
      window.location.hash = "#/catalog";
    } else {
      onHashChange();
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

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

  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    setCatalogError(null);
    Promise.all([apiCatalog(catalogFilters), apiManufacturers()])
      .then(([items, manufacturerList]) => {
        if (!active) return;
        setProducts(items.map(mapApiProduct));
        setManufacturers(["all", ...manufacturerList]);
      })
      .catch((error: Error) => {
        if (!active) return;
        setCatalogError(error.message);
        setProducts(CATALOG);
        setManufacturers(["all", ...new Set(CATALOG.map((p) => p.manufacturer))]);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => { active = false; };
  }, [catalogFilters]);

  useEffect(() => {
    if (route.name !== "product") {
      setSelectedProduct(null);
      return;
    }
    let active = true;
    setSelectedProduct(null);
    setCatalogError(null);
    apiProduct(route.article)
      .then((item) => {
        if (!active) return;
        setSelectedProduct(mapApiProduct(item));
      })
      .catch((error: Error) => {
        if (!active) return;
        setCatalogError(error.message);
        const fallback = CATALOG.find((p) => p.article === route.article);
        if (fallback) setSelectedProduct(fallback);
      });
    return () => { active = false; };
  }, [route]);

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
      .catch((error: Error) => {
        if (!active) return;
        setOrdersError(error.message);
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });
    return () => { active = false; };
  }, [route, auth]);

  const summary = useMemo(() => buildSummary(products), [products]);
  const featured = useMemo(() => products.find((item) => item.discountPercent > 15) ?? products[0], [products]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate(async () => apiLogin(loginForm), "добро пожаловать");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate(async () => apiRegister({ ...registerForm, full_name: registerForm.fullName }), "аккаунт создан");
  }

  async function authenticate(loader: () => Promise<AuthSession>, successMessage: string) {
    try {
      setBusy(true);
      const session = await loader();
      commitSession(session);
      setMessage(`${session.fullName}, ${successMessage}!`);
      const ordered = await fulfillPendingOrder(session);
      if (!ordered) navigate({ name: "catalog" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить действие");
    } finally {
      setBusy(false);
    }
  }

  function commitSession(session: AuthSession) {
    setAuth(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  async function fulfillPendingOrder(session: AuthSession) {
    const pending = sessionStorage.getItem(PENDING_ORDER_KEY);
    if (!pending) return false;
    sessionStorage.removeItem(PENDING_ORDER_KEY);
    await apiCreateOrder(session.token, { items: [{ article: pending, quantity: 1 }] });
    setMessage("Заказ создан автоматически после входа.");
    navigate({ name: "orders" });
    return true;
  }

  async function handleOrder(article: string) {
    if (!auth) {
      sessionStorage.setItem(PENDING_ORDER_KEY, article);
      setMessage("Сначала войдите в систему, чтобы оформить заказ.");
      navigate({ name: "login" });
      return;
    }
    try {
      setBusy(true);
      await apiCreateOrder(auth.token, { items: [{ article, quantity: 1 }] });
      setMessage("Заказ оформлен!");
      const fetcher = (auth.role === "admin" || auth.role === "manager") ? apiAllOrders : apiOrders;
      const items = await fetcher(auth.token);
      setOrders(items);
      navigate({ name: "orders" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось оформить заказ");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateOrderStatus(number: number, newStatus: string) {
    if (!auth) return;
    try {
      await apiUpdateOrder(auth.token, number, { status: newStatus });
      setMessage(`Статус заказа #${number} обновлён`);
      const fetcher = (auth.role === "admin" || auth.role === "manager") ? apiAllOrders : apiOrders;
      const items = await fetcher(auth.token);
      setOrders(items);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось обновить статус");
    }
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(PENDING_ORDER_KEY);
    setOrders([]);
    setMessage("Вы вышли из системы.");
    navigate({ name: "catalog" });
  }

  function navigate(route: Route) {
    window.location.hash = routeToHash(route);
    setMobileMenuOpen(false);
  }

  return (
    <TooltipProvider>
      <div
        className="min-h-screen flex flex-col"
        style={{
          fontFamily: "'Times New Roman', Times, Georgia, serif",
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* кастомный тайтлбар для десктопа — за него можно перетаскивать окно */}
        <div
          data-tauri-drag-region
          className="flex items-center justify-between h-10 px-4 select-none shrink-0"
          style={{ backgroundColor: "#2E8B57", color: "#FFFFFF" }}
        >
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="text-sm font-bold">ShoeStore Desktop</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/20" style={{ color: "#FFFFFF" }}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/20" style={{ color: "#FFFFFF" }}>
              <Square className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-red-500" style={{ color: "#FFFFFF" }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* навигация. на десктопе чуть компактнее */}
        <header className="sticky top-10 z-50 w-full border-b shrink-0" style={{ backgroundColor: "#FFFFFF", borderColor: "#e0e0e0" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate({ name: "catalog" })}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00FA9A" }}>
                    <Store className="h-4 w-4" style={{ color: "#0a2e1a" }} />
                  </div>
                  <div>
                    <h1 className="text-base font-bold">ShoeStore</h1>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: "#666" }}>Desktop Edition</p>
                  </div>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => navigate({ name: "catalog" })}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Каталог
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate({ name: "orders" })}>
                  <Package className="h-4 w-4 mr-2" />
                  Заказы
                </Button>
              </nav>

              <div className="flex items-center gap-2">
                {auth ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2 h-9">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]" style={{ backgroundColor: "#00FA9A", color: "#0a2e1a" }}>
                            {auth.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-sm font-medium">{auth.fullName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-bold">{auth.fullName}</p>
                          <p className="text-xs" style={{ color: "#666" }}>{auth.login} · {auth.role}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate({ name: "orders" })}>
                        <Package className="mr-2 h-4 w-4" />
                        Мои заказы
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ name: "catalog" })}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Каталог
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate({ name: "login" })}>Войти</Button>
                    <Button size="sm" onClick={() => navigate({ name: "register" })} style={{ backgroundColor: "#00FA9A", color: "#0a2e1a" }}>Регистрация</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* уведомления */}
        {message && (
          <div className="px-4 sm:px-6 lg:px-8 pt-4 shrink-0">
            <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "#f0fff0", borderColor: "#00FA9A" }}>
              <Tag className="h-4 w-4 shrink-0" style={{ color: "#2E8B57" }} />
              <span className="text-sm font-medium">{message}</span>
              <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0" onClick={() => setMessage(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* основной контент — на десктопе он скроллится внутри основного окна */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={route.name + (route.name === 'product' ? route.article : '')}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </TooltipProvider>
  );

  function renderPage() {
    switch (route.name) {
      case "login":
        return <LoginPage busy={busy} loginForm={loginForm} auth={auth} onLoginChange={setLoginForm} onLoginSubmit={handleLogin} onNavigate={navigate} />;
      case "register":
        return <RegisterPage busy={busy} registerForm={registerForm} onRegisterChange={setRegisterForm} onRegisterSubmit={handleRegister} onNavigate={navigate} />;
      case "orders":
        return <OrdersPage auth={auth} orders={orders} loading={ordersLoading} error={ordersError} onGoLogin={() => navigate({ name: "login" })} onRefresh={() => auth && ((auth.role === "admin" || auth.role === "manager") ? apiAllOrders : apiOrders)(auth.token).then(setOrders)} onUpdateStatus={handleUpdateOrderStatus} />;
      case "product":
        return <ProductPage auth={auth} product={selectedProduct} loading={catalogLoading && !selectedProduct} error={catalogError} onOrder={handleOrder} onGoLogin={() => navigate({ name: "login" })} onBack={() => navigate({ name: "catalog" })} />;
      default:
        return <CatalogPage featured={featured} summary={summary} products={products} manufacturers={manufacturers} filters={catalogFilters} loading={catalogLoading} error={catalogError} onFiltersChange={setCatalogFilters} onOrder={handleOrder} onProduct={(article) => navigate({ name: "product", article })} defaultFilters={DEFAULT_FILTERS} />;
    }
  }
}
