import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  apiCatalog,
  apiCreateOrder,
  apiLogin,
  apiManufacturers,
  apiMe,
  apiOrders,
  apiProduct,
  apiRegister,
} from "./api";
import { buildSummary, discountedPrice } from "./catalog";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FieldLabel,
  Input,
  Metric,
  Select,
  Separator,
  Skeleton,
  Switch,
} from "./ui";
import type {
  ApiOrder,
  ApiProduct,
  AuthSession,
  CatalogFilters,
  Product,
  Route,
} from "./types";

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

const DEFAULT_LOGIN = {
  login: "",
  password: "",
};

const DEFAULT_REGISTER = {
  fullName: "",
  login: "",
  password: "",
};

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
          setAuth({
            token: parsed.token,
            login: me.login,
            fullName: me.full_name,
            role: me.role,
          });
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
    apiManufacturers()
      .then((list) => {
        if (active) setManufacturers(["all", ...list]);
      })
      .catch((err) => console.error("Failed to load manufacturers", err));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    setCatalogError(null);
    
    console.log("FETCHING CATALOG:", catalogFilters);
    apiCatalog(catalogFilters)
      .then((response) => {
        if (!active) return;
        console.log("CATALOG RESPONSE:", response.total, "items");
        setProducts(response.items.map(mapApiProduct));
        setTotalItems(response.total);
      })
      .catch((error: Error) => {
        if (!active) return;
        setCatalogError(error.message);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
      
    return () => {
      active = false;
    };
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
      });
    return () => {
      active = false;
    };
  }, [route]);

  useEffect(() => {
    if (route.name !== "orders" || !auth) {
      return;
    }
    let active = true;
    setOrdersLoading(true);
    setOrdersError(null);
    apiOrders(auth.token)
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
    return () => {
      active = false;
    };
  }, [route, auth]);

  const summary = useMemo(() => buildSummary(products), [products]);
  const featured = useMemo(() => products.find((item) => item.discountPercent > 15) ?? products[0], [products]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate(async () => apiLogin(loginForm), "вошли в систему");
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await authenticate(async () => apiRegister({ ...registerForm, full_name: registerForm.fullName }), "аккаунт создан");
  }

  async function authenticate(
    loader: () => Promise<AuthSession>,
    successMessage: string,
  ) {
    try {
      setBusy(true);
      const session = await loader();
      commitSession(session);
      setMessage(`${session.fullName}, ${successMessage}.`);
      const ordered = await fulfillPendingOrder(session);
      if (!ordered) navigate({ name: "catalog" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "не удалось выполнить действие");
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
    await apiCreateOrder(session.token, {
      items: [{ article: pending, quantity: 1 }],
    });
    setMessage("заказ создан автоматически после входа.");
    navigate({ name: "orders" });
    return true;
  }

  async function handleOrder(article: string) {
    if (!auth) {
      sessionStorage.setItem(PENDING_ORDER_KEY, article);
      setMessage("сначала войди в систему, чтобы оформить заказ.");
      navigate({ name: "login" });
      return;
    }
    try {
      setBusy(true);
      await apiCreateOrder(auth.token, { items: [{ article, quantity: 1 }] });
      setMessage("заказ оформлен.");
      await refreshOrders(auth.token);
      navigate({ name: "orders" });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "не удалось оформить заказ");
    } finally {
      setBusy(false);
    }
  }

  async function refreshOrders(token: string) {
    const items = await apiOrders(token);
    setOrders(items);
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(PENDING_ORDER_KEY);
    setOrders([]);
    setMessage("вы вышли из системы.");
    navigate({ name: "catalog" });
  }

  function navigate(route: Route) {
    window.location.hash = routeToHash(route);
  }

  const page = renderPage();

  return (
    <main className="shell">
      <Header
        auth={auth}
        onNavigate={navigate}
        onLogout={handleLogout}
        onLogin={() => navigate({ name: "login" })}
        onRegister={() => navigate({ name: "register" })}
      />

      {message ? <div className="message-bar">{message}</div> : null}

      {page}
    </main>
  );

  function handleFiltersChange(newFilters: CatalogFilters) {
    // если изменилось что-то кроме страницы — сбрасываем на первую
    const isPageChange = newFilters.page !== catalogFilters.page;
    if (!isPageChange && newFilters.page !== 1) {
      newFilters.page = 1;
    }
    setCatalogFilters(newFilters);
  }

  function renderPage() {
    switch (route.name) {
      case "login":
        return (
          <AuthPage
            mode="login"
            busy={busy}
            loginForm={loginForm}
            registerForm={registerForm}
            auth={auth}
            onLoginChange={setLoginForm}
            onRegisterChange={setRegisterForm}
            onLoginSubmit={handleLogin}
            onRegisterSubmit={handleRegister}
          />
        );
      case "register":
        return (
          <AuthPage
            mode="register"
            busy={busy}
            loginForm={loginForm}
            registerForm={registerForm}
            auth={auth}
            onLoginChange={setLoginForm}
            onRegisterChange={setRegisterForm}
            onLoginSubmit={handleLogin}
            onRegisterSubmit={handleRegister}
          />
        );
      case "orders":
        return (
          <OrdersPage
            auth={auth}
            orders={orders}
            loading={ordersLoading}
            error={ordersError}
            onGoLogin={() => navigate({ name: "login" })}
            onRefresh={() => auth && refreshOrders(auth.token)}
          />
        );
      case "product":
        return (
          <ProductPage
            auth={auth}
            product={selectedProduct}
            loading={catalogLoading && !selectedProduct}
            error={catalogError}
            onOrder={handleOrder}
            onGoLogin={() => navigate({ name: "login" })}
          />
        );
      default:
        return (
          <CatalogPage
            auth={auth}
            featured={featured}
            summary={summary}
            products={products}
            manufacturers={manufacturers}
            filters={catalogFilters}
            loading={catalogLoading}
            error={catalogError}
            totalItems={totalItems}
            onFiltersChange={handleFiltersChange}
            onOrder={handleOrder}
            onProduct={(article) => navigate({ name: "product", article })}
            onGoLogin={() => navigate({ name: "login" })}
            onGoRegister={() => navigate({ name: "register" })}
            onGoOrders={() => navigate({ name: "orders" })}
          />
        );
    }
  }
}

function Header({
  auth,
  onNavigate,
  onLogout,
  onLogin,
  onRegister,
}: {
  auth: AuthSession | null;
  onNavigate: (route: Route) => void;
  onLogout: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <header className="topbar topbar--app">
      <div className="brand">
        <div className="brand__mark">mdk1101</div>
        <div className="brand__copy">
          <p className="eyebrow">shoe store workspace</p>
          <h1>единый интерфейс для web и tauri</h1>
          <p className="lede">
            каталог, авторизация, регистрация, заказы и карточки товара работают через один backend.
          </p>
        </div>
      </div>

      <div className="topbar__pills topbar__actions">
        <Button variant="ghost" onClick={() => onNavigate({ name: "catalog" })}>
          каталог
        </Button>
        <Button variant="ghost" onClick={() => onNavigate({ name: "orders" })}>
          заказы
        </Button>
        {auth ? (
          <>
            <Badge tone="soft">
              {auth.fullName} · {auth.role}
            </Badge>
            <Button variant="soft" onClick={onLogout}>
              выйти
            </Button>
          </>
        ) : (
          <>
            <Button variant="soft" onClick={onLogin}>
              вход
            </Button>
            <Button onClick={onRegister}>регистрация</Button>
          </>
        )}
      </div>
    </header>
  );
}

function CatalogPage({
  auth,
  featured,
  summary,
  products,
  manufacturers,
  filters,
  loading,
  error,
  totalItems,
  onFiltersChange,
  onOrder,
  onProduct,
  onGoLogin,
  onGoRegister,
  onGoOrders,
}: {
  auth: AuthSession | null;
  featured?: Product;
  summary: ReturnType<typeof buildSummary>;
  products: Product[];
  manufacturers: string[];
  filters: CatalogFilters;
  loading: boolean;
  error: string | null;
  totalItems: number;
  onFiltersChange: (filters: CatalogFilters) => void;
  onOrder: (article: string) => Promise<void>;
  onProduct: (article: string) => void;
  onGoLogin: () => void;
  onGoRegister: () => void;
  onGoOrders: () => void;
}) {
  const totalPages = Math.ceil(totalItems / filters.pageSize);
  
  const handlePageChange = (page: number) => {
    onFiltersChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <>
      <section className="hero">
        <Card className="hero__copy panel">
          <CardHeader className="hero__headline">
            <div>
              <p className="hero__kicker">витрина товара</p>
              <CardTitle>поиск, фильтрация и скидки работают как один поток</CardTitle>
              <CardDescription>
                это уже не статический макет: кнопки идут в backend, регистрация создает сессию,
                а заказ оформляется через api.
              </CardDescription>
            </div>
            {featured ? (
              <Badge tone={featured.discountPercent > 15 ? "success" : "secondary"}>
                скидка {featured.discountPercent}%
              </Badge>
            ) : (
              <Badge tone="secondary">каталог</Badge>
            )}
          </CardHeader>

          <Separator />

          <CardContent>
            <div className="hero__metrics">
              <Metric value={summary.total} label="товаров" />
              <Metric value={summary.discounted} label="со скидкой" />
              <Metric value={summary.inStock} label="в наличии" />
              <Metric value={summary.manufacturers} label="производителей" />
            </div>

            <div className="hero__actions">
              {auth ? (
                <Button onClick={onGoOrders}>мои заказы</Button>
              ) : (
                <Button onClick={onGoLogin}>войти в систему</Button>
              )}
              <Button variant="secondary" onClick={onGoRegister}>
                создать аккаунт
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hero__feature panel panel--feature">
          <CardHeader className="feature__title-row">
            <div>
              <p className="hero__kicker">featured item</p>
              <CardTitle>
                {featured ? `${featured.category} | ${featured.name}` : "каталог пока пуст"}
              </CardTitle>
              <CardDescription>
                {featured ? featured.description : "подключись к api, и карточки появятся здесь."}
              </CardDescription>
            </div>
            {featured ? (
              <Badge tone={featured.discountPercent > 15 ? "success" : "outline"}>
                {featured.article}
              </Badge>
            ) : null}
          </CardHeader>

          <Separator />

          <CardContent>
            <div className="feature__media">
              <img src={featured?.imagePath || "/picture.png"} alt={featured?.name ?? "catalog"} />
              {featured && featured.stockCount <= 0 ? (
                <span className="feature__flag">нет на складе</span>
              ) : null}
            </div>

            {featured ? (
              <div className="feature__facts">
                <div>
                  <span>производитель</span>
                  <strong>{featured.manufacturer}</strong>
                </div>
                <div>
                  <span>поставщик</span>
                  <strong>{featured.supplier}</strong>
                </div>
                <div>
                  <span>цена</span>
                  <strong>
                    {formatMoney(featured.price)} / {formatMoney(discountedPrice(featured))}
                  </strong>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="workspace">
        <aside className="sidebar">
          <Card className="panel panel--sidebar">
            <CardHeader className="panel__title">
              <div>
                <p className="hero__kicker">контроль</p>
                <CardTitle>фильтры и сортировка</CardTitle>
                <CardDescription>живая выдача товара без перезагрузки страницы.</CardDescription>
              </div>
              <Badge tone="secondary">живой поиск</Badge>
            </CardHeader>

            <Separator />

            <CardContent>
              <div className="form-grid">
                <div className="field">
                  <FieldLabel htmlFor="search">поиск по описанию</FieldLabel>
                  <Input
                    id="search"
                    placeholder="например, ботинки"
                    value={filters.search}
                    onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
                  />
                </div>

                <div className="field">
                  <FieldLabel htmlFor="manufacturer">производитель</FieldLabel>
                  <Select
                    id="manufacturer"
                    value={filters.manufacturer}
                    onChange={(event) =>
                      onFiltersChange({ ...filters, manufacturer: event.target.value })
                    }
                  >
                    {manufacturers.map((manufacturer) => (
                      <option key={manufacturer} value={manufacturer}>
                        {manufacturer === "all" ? "все производители" : manufacturer}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="field">
                  <FieldLabel htmlFor="maxPrice">цена не выше</FieldLabel>
                  <Input
                    id="maxPrice"
                    inputMode="numeric"
                    placeholder="5000"
                    value={filters.maxPrice}
                    onChange={(event) => onFiltersChange({ ...filters, maxPrice: event.target.value })}
                  />
                </div>

                <div className="field">
                  <FieldLabel htmlFor="sortBy">сортировка</FieldLabel>
                  <Select
                    id="sortBy"
                    value={filters.sortBy}
                    onChange={(event) =>
                      onFiltersChange({
                        ...filters,
                        sortBy: event.target.value as CatalogFilters["sortBy"],
                      })
                    }
                  >
                    <option value="name">по названию</option>
                    <option value="supplier">по поставщику</option>
                    <option value="price">по цене</option>
                    <option value="price_desc">по убыванию цены</option>
                  </Select>
                </div>
              </div>

              <div className="toggle-stack">
                <Switch
                  label="только со скидкой"
                  checked={filters.onlyDiscounted}
                  onChange={(event) =>
                    onFiltersChange({ ...filters, onlyDiscounted: event.target.checked })
                  }
                />
                <Switch
                  label="только в наличии"
                  checked={filters.onlyInStock}
                  onChange={(event) =>
                    onFiltersChange({ ...filters, onlyInStock: event.target.checked })
                  }
                />
              </div>
            </CardContent>

            <CardFooter className="sidebar__actions">
              <Button variant="secondary" onClick={() => onFiltersChange(DEFAULT_FILTERS)}>
                сбросить
              </Button>
              <Button variant="outline" onClick={onGoOrders}>
                показать заказы
              </Button>
            </CardFooter>
          </Card>
        </aside>

        <section className="catalog">
          <div className="catalog__header">
            <div>
              <p className="hero__kicker">витрина</p>
              <h3>{loading ? "загрузка каталога..." : `${products.length} позиций найдено`}</h3>
            </div>
            <Badge tone="soft">
              {summary.featured} позиций со скидкой выше 15%
            </Badge>
          </div>

          {error ? <div className="message-bar message-bar--error">{error}</div> : null}

          <div className="catalog__grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.article}
                product={product}
                index={index}
                loggedIn={!!auth}
                onOrder={onOrder}
                onOpen={() => onProduct(product.article)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="catalog__pagination">
              <Button
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() => onFiltersChange({ ...filters, page: filters.page - 1 })}
              >
                назад
              </Button>
              <div className="pagination__info">
                страница <strong>{filters.page}</strong> из {totalPages}
              </div>
              <Button
                variant="outline"
                disabled={filters.page >= totalPages}
                onClick={() => onFiltersChange({ ...filters, page: filters.page + 1 })}
              >
                вперед
              </Button>
            </div>
          )}
        </section>

        <aside className="rail">
          <Card className="panel panel--rail">
            <div className="panel__title">
              <div>
                <p className="hero__kicker">сводка</p>
                <h3>рабочие правила</h3>
              </div>
            </div>

            <div className="rail__stack">
              <div className="rail__item">
                <span>скидка больше 15%</span>
                <strong className="rail__green">фон #2E8B57</strong>
              </div>
              <div className="rail__item">
                <span>основной фон</span>
                <strong>#ffffff</strong>
              </div>
              <div className="rail__item">
                <span>дополнительный фон</span>
                <strong>#7fff00</strong>
              </div>
              <div className="rail__item">
                <span>акцент действия</span>
                <strong>#00fa9a</strong>
              </div>
            </div>

            <div className="rail__mini">
              <div>
                <span>брендов</span>
                <strong>{summary.manufacturers}</strong>
              </div>
              <div>
                <span>в наличии</span>
                <strong>{summary.inStock}</strong>
              </div>
            </div>

            <div className="rail__note">
              все блоки используют один и тот же shared ui, поэтому web и tauri выглядят одинаково.
            </div>
          </Card>
        </aside>
      </section>
    </>
  );
}

function ProductCard({
  product,
  index,
  onOrder,
  onOpen,
  loggedIn,
}: {
  product: Product;
  index: number;
  onOrder: (article: string) => Promise<void>;
  onOpen: () => void;
  loggedIn: boolean;
}) {
  const featured = product.discountPercent > 15;

  return (
    <Card
      className={`product-card ${featured ? "product-card--featured" : ""}`}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <button className="product-card__media product-card__media--button" type="button" onClick={onOpen}>
        <img src={product.imagePath || "/picture.png"} alt={product.name} />
        <Badge tone={featured ? "success" : "soft"}>{product.article}</Badge>
      </button>

      <div className="product-card__body">
        <div className="product-card__title-row">
          <div>
            <p className="hero__kicker">{product.category}</p>
            <h4>{product.name}</h4>
          </div>
          <Badge tone={featured ? "success" : "accent"}>{product.discountPercent}%</Badge>
        </div>

        <p className="product-card__description">{product.description}</p>

        <div className="product-card__meta">
          <span>производитель</span>
          <strong>{product.manufacturer}</strong>
        </div>
        <div className="product-card__meta">
          <span>поставщик</span>
          <strong>{product.supplier}</strong>
        </div>
        <div className="product-card__meta">
          <span>остаток</span>
          <strong className={product.stockCount <= 0 ? "rail__green" : ""}>{product.stockCount}</strong>
        </div>

        <div className="product-card__price">
          <div>
            <span>цена</span>
            <strong className="price-old">{formatMoney(product.price)}</strong>
          </div>
          <div>
            <span>после скидки</span>
            <strong>{formatMoney(discountedPrice(product))}</strong>
          </div>
        </div>

        <div className="product-card__actions">
          <Button variant="soft" onClick={onOpen}>
            детали
          </Button>
          <Button onClick={() => onOrder(product.article)} disabled={!loggedIn && false}>
            заказать
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AuthPage({
  mode,
  busy,
  loginForm,
  registerForm,
  auth,
  onLoginChange,
  onRegisterChange,
  onLoginSubmit,
  onRegisterSubmit,
}: {
  mode: "login" | "register";
  busy: boolean;
  loginForm: { login: string; password: string };
  registerForm: { fullName: string; login: string; password: string };
  auth: AuthSession | null;
  onLoginChange: (next: { login: string; password: string }) => void;
  onRegisterChange: (next: { fullName: string; login: string; password: string }) => void;
  onLoginSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onRegisterSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <section className="auth-layout">
      <Card className="auth-hero panel">
        <CardHeader>
          <div>
            <p className="hero__kicker">{mode === "login" ? "вход" : "регистрация"}</p>
            <CardTitle>{mode === "login" ? "зайти в систему" : "создать новый аккаунт"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "после входа появится доступ к заказам, а кнопка заказать на карточке товара начнет создавать реальные заказы."
                : "регистрация создает пользователя в backend и сразу выдает активную сессию."}
            </CardDescription>
          </div>
          <Badge tone="secondary">{mode === "login" ? "login" : "register"}</Badge>
        </CardHeader>

        <Separator />

        <CardContent>
          <div className="auth-hero__badges">
            <Badge tone="secondary">jwt auth</Badge>
            <Badge tone="secondary">route aware</Badge>
            <Badge tone="secondary">shared ui</Badge>
          </div>

          {auth ? <div className="rail__note">ты уже вошел как {auth.fullName}.</div> : null}
        </CardContent>
      </Card>

      <Card className="auth-card">
        {mode === "login" ? (
          <form className="auth-form" onSubmit={onLoginSubmit}>
            <div className="field">
              <FieldLabel htmlFor="login-login">логин</FieldLabel>
              <Input
                id="login-login"
                value={loginForm.login}
                onChange={(event) => onLoginChange({ ...loginForm, login: event.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="login-password">пароль</FieldLabel>
              <Input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(event) => onLoginChange({ ...loginForm, password: event.target.value })}
                placeholder="client"
              />
            </div>
            <CardFooter className="auth-form__footer">
              <Button type="submit" disabled={busy}>
                войти
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form className="auth-form" onSubmit={onRegisterSubmit}>
            <div className="field">
              <FieldLabel htmlFor="register-fullname">фио</FieldLabel>
              <Input
                id="register-fullname"
                value={registerForm.fullName}
                onChange={(event) =>
                  onRegisterChange({ ...registerForm, fullName: event.target.value })
                }
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="register-login">логин</FieldLabel>
              <Input
                id="register-login"
                value={registerForm.login}
                onChange={(event) => onRegisterChange({ ...registerForm, login: event.target.value })}
                placeholder="newuser@example.com"
              />
            </div>
            <div className="field">
              <FieldLabel htmlFor="register-password">пароль</FieldLabel>
              <Input
                id="register-password"
                type="password"
                value={registerForm.password}
                onChange={(event) =>
                  onRegisterChange({ ...registerForm, password: event.target.value })
                }
                placeholder="your-password"
              />
            </div>
            <CardFooter className="auth-form__footer">
              <Button type="submit" disabled={busy}>
                зарегистрироваться
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </section>
  );
}

function OrdersPage({
  auth,
  orders,
  loading,
  error,
  onGoLogin,
  onRefresh,
}: {
  auth: AuthSession | null;
  orders: ApiOrder[];
  loading: boolean;
  error: string | null;
  onGoLogin: () => void;
  onRefresh: () => void;
}) {
  if (!auth) {
    return (
      <Card className="auth-empty">
        <h2>сначала войди в систему</h2>
        <p>страница заказов доступна только после авторизации.</p>
        <Button onClick={onGoLogin}>перейти ко входу</Button>
      </Card>
    );
  }

  return (
    <section className="orders-page">
      <Card className="orders-card">
        <CardHeader className="orders-card__head">
          <div>
            <p className="hero__kicker">заказы</p>
            <CardTitle>история заказов и текущие статусы</CardTitle>
            <CardDescription>здесь видны все заказы и их текущее состояние.</CardDescription>
          </div>
          <Button variant="secondary" onClick={onRefresh}>
            обновить
          </Button>
        </CardHeader>

        <Separator />

        <CardContent className="orders-card__content">
          {error ? <div className="message-bar message-bar--error">{error}</div> : null}
        {loading ? (
          <div className="empty-state">
            <div className="empty-state__icon" />
            <h4>загрузка заказов</h4>
            <p>подтягиваем данные с backend...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon" />
            <h4>заказов пока нет</h4>
            <p>можно перейти в каталог и оформить первый заказ.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>номер</th>
                <th>клиент</th>
                <th>состав</th>
                <th>дата заказа</th>
                <th>доставка</th>
                <th>код</th>
                <th>статус</th>
                <th>итого</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.number}>
                  <td>{order.number}</td>
                  <td>{order.user_full_name}</td>
                  <td>
                    {order.items.map((item) => `${item.article} × ${item.quantity}`).join(", ")}
                  </td>
                  <td>{order.created_at}</td>
                  <td>{order.delivery_date}</td>
                  <td>{order.pickup_code}</td>
                  <td>{order.status}</td>
                  <td>{formatMoney(Number(order.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </CardContent>
      </Card>
    </section>
  );
}

function ProductPage({
  auth,
  product,
  loading,
  error,
  onOrder,
  onGoLogin,
}: {
  auth: AuthSession | null;
  product: Product | null;
  loading: boolean;
  error: string | null;
  onOrder: (article: string) => Promise<void>;
  onGoLogin: () => void;
}) {
  if (loading) {
    return (
      <Card className="auth-empty">
        <h2>загрузка товара</h2>
        <p>ищем карточку по артикулу.</p>
      </Card>
    );
  }

  if (!product) {
    return (
      <Card className="auth-empty">
        <h2>товар не найден</h2>
        <p>{error ?? "не удалось открыть карточку товара."}</p>
      </Card>
    );
  }

  return (
    <section className="detail-layout">
      <Card className="detail-card panel">
        <CardHeader className="detail-card__head">
          <div>
            <p className="hero__kicker">карточка товара</p>
            <CardTitle>
              {product.category} | {product.name}
            </CardTitle>
            <CardDescription>{product.description}</CardDescription>
          </div>
          <Badge tone={product.discountPercent > 15 ? "success" : "secondary"}>{product.article}</Badge>
        </CardHeader>

        <CardContent className="detail-card__content">
          <div className="feature__media">
            <img src={product.imagePath || "/picture.png"} alt={product.name} />
            {product.stockCount <= 0 ? <span className="feature__flag">нет на складе</span> : null}
          </div>

          <div className="feature__facts">
            <div>
              <span>производитель</span>
              <strong>{product.manufacturer}</strong>
            </div>
            <div>
              <span>поставщик</span>
              <strong>{product.supplier}</strong>
            </div>
            <div>
              <span>цена</span>
              <strong>
                {formatMoney(product.price)} / {formatMoney(discountedPrice(product))}
              </strong>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="panel panel--sidebar">
        <CardHeader className="panel__title">
          <div>
            <p className="hero__kicker">действия</p>
            <CardTitle>оформить заказ</CardTitle>
            <CardDescription>один товар можно быстро отправить в новый заказ.</CardDescription>
          </div>
        </CardHeader>

        <Separator />

        <CardContent>
          <div className="rail__mini">
            <div>
              <span>остаток</span>
              <strong>{product.stockCount}</strong>
            </div>
            <div>
              <span>скидка</span>
              <strong>{product.discountPercent}%</strong>
            </div>
          </div>
        </CardContent>

        <CardFooter className="sidebar__actions">
          {auth ? (
            <Button onClick={() => onOrder(product.article)}>заказать</Button>
          ) : (
            <Button onClick={onGoLogin}>войти, чтобы заказать</Button>
          )}
        </CardFooter>
      </Card>
    </section>
  );
}

function CatalogSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card className="product-card product-card--skeleton" key={index}>
          <Skeleton className="skeleton-box skeleton-box--image" />
          <div className="product-card__body">
            <Skeleton className="skeleton-row" />
            <Skeleton className="skeleton-row skeleton-row--wide" />
            <Skeleton className="skeleton-row" />
            <Skeleton className="skeleton-row skeleton-row--wide" />
          </div>
        </Card>
      ))}
    </>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="empty-state">
      <div className="empty-state__icon" />
      <h4>ничего не найдено</h4>
      <p>попробуй сбросить фильтры или убрать часть ограничений, чтобы вернуть товары в выборку.</p>
      <Button onClick={onReset}>сбросить фильтры</Button>
    </Card>
  );
}

function mapApiProduct(item: ApiProduct): Product {
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

function parseRoute(hash: string): Route {
  const cleaned = hash.replace(/^#\/?/, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts[0] === "login") return { name: "login" };
  if (parts[0] === "register") return { name: "register" };
  if (parts[0] === "orders") return { name: "orders" };
  if (parts[0] === "product" && parts[1]) return { name: "product", article: decodeURIComponent(parts[1]) };
  return { name: "catalog" };
}

function routeToHash(route: Route): string {
  if (route.name === "product") return `#/product/${encodeURIComponent(route.article)}`;
  return `#/${route.name}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
