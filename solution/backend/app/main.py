"""api обувного магазина — fastapi с sqlite через sqlalchemy."""

from __future__ import annotations

from dataclasses import replace
from datetime import date
from decimal import Decimal

from fastapi import Depends, FastAPI, Header, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError
from sqlalchemy.orm import Session

from . import crud
from .database import get_db, init_db
from .domain import CatalogQuery, OrderStatus, Product, Role, SortKey, User, apply_catalog_query
from .schemas import (
    CatalogQueryResponse,
    LoginRequest,
    MeResponse,
    OrderCreateRequest,
    OrderItemResponse,
    OrderResponse,
    OrderUpdateRequest,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    RegisterRequest,
    TokenResponse,
)
from .security import create_access_token, decode_access_token

app = FastAPI(title="Shoe Store API", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """при старте — инициализируем таблицы и заполняем данные."""
    init_db()
    # проверяем, пустая ли база — если да, заполняем из excel
    from .database import SessionLocal
    db = SessionLocal()
    try:
        if not crud.list_products(db):
            from .seed import seed
            seed()
    finally:
        db.close()


# ─── конвертация доменных объектов в ответы api ───


def product_to_response(product: Product) -> ProductResponse:
    """конвертируем доменный товар в pydantic-модель ответа."""
    return ProductResponse(
        article=product.article,
        name=product.name,
        description=product.description,
        manufacturer=product.manufacturer,
        supplier=product.supplier,
        category=product.category,
        unit=product.unit,
        price=product.price,
        discount_percent=product.discount_percent,
        stock_count=product.stock_count,
        image_path=product.image_path,
        discounted_price=product.discounted_price,
        has_discount=product.has_discount,
        in_stock=product.in_stock,
    )


def order_to_response(order, db: Session) -> OrderResponse:
    """конвертируем доменный заказ в pydantic-модель ответа."""
    user = crud.get_user_by_login(db, order.user_login)
    return OrderResponse(
        number=order.number,
        user_login=order.user_login,
        user_full_name=user.full_name if user else order.user_login,
        created_at=order.created_at,
        delivery_date=order.delivery_date,
        pickup_code=order.pickup_code,
        status=order.status,
        total=order.total,
        items=[
            OrderItemResponse(
                article=item.article,
                quantity=item.quantity,
                unit_price=item.unit_price,
                total=item.total,
            )
            for item in order.items
        ],
    )


# ─── авторизация ───


def current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """извлекаем текущего пользователя из jwt-токена."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = decode_access_token(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    user = crud.get_user_by_login(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


def require_roles(*roles: Role):
    """dependency — проверяем что у пользователя нужная роль."""
    def dependency(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        return user
    return dependency


# ─── эндпоинты ───


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """регистрация нового пользователя."""
    if crud.get_user_by_login(db, payload.login):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Login already exists")
    user = User(
        login=payload.login,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=payload.password,
    )
    crud.create_user(db, user)
    return TokenResponse(
        access_token=create_access_token(user.login, user.role),
        full_name=user.full_name,
        role=user.role,
        login=user.login,
    )


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """вход по логину и паролю."""
    user = crud.get_user_by_login(db, payload.login)
    if user is None or user.password_hash != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(
        access_token=create_access_token(user.login, user.role),
        full_name=user.full_name,
        role=user.role,
        login=user.login,
    )


@app.get("/auth/me", response_model=MeResponse)
def me(user: User = Depends(current_user)) -> MeResponse:
    """информация о текущем пользователе."""
    return MeResponse(login=user.login, full_name=user.full_name, role=user.role)


@app.get("/manufacturers", response_model=list[str])
def manufacturers(db: Session = Depends(get_db)) -> list[str]:
    """список всех производителей (для фильтра)."""
    return crud.list_manufacturer_names(db)


@app.get("/catalog", response_model=list[CatalogQueryResponse])
def catalog(
    search: str = "",
    manufacturer: str | None = Query(default=None),
    max_price: Decimal | None = None,
    only_discounted: bool = False,
    only_in_stock: bool = False,
    sort_by: SortKey = SortKey.NAME,
    db: Session = Depends(get_db),
) -> list[CatalogQueryResponse]:
    """каталог товаров с фильтрами и сортировкой."""
    products = crud.list_products(db)
    items = apply_catalog_query(
        products,
        CatalogQuery(
            search=search,
            manufacturer=manufacturer,
            max_price=max_price,
            only_discounted=only_discounted,
            only_in_stock=only_in_stock,
            sort_by=sort_by,
        ),
    )
    return [product_to_response(product) for product in items]


@app.get("/products/{article}", response_model=ProductResponse)
def product_detail(article: str, db: Session = Depends(get_db)) -> ProductResponse:
    """получаем товар по артикулу."""
    product = crud.get_product(db, article)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_response(product)


@app.post("/products", response_model=ProductResponse)
def create_product(
    payload: ProductCreate,
    _: User = Depends(require_roles(Role.ADMIN, Role.MANAGER)),
    db: Session = Depends(get_db),
) -> ProductResponse:
    """создаём товар (admin/manager)."""
    product = Product(**payload.model_dump())
    saved = crud.upsert_product(db, product)
    return product_to_response(saved)


@app.patch("/products/{article}", response_model=ProductResponse)
def update_product(
    article: str,
    payload: ProductUpdate,
    _: User = Depends(require_roles(Role.ADMIN, Role.MANAGER)),
    db: Session = Depends(get_db),
) -> ProductResponse:
    """обновляем товар (admin/manager)."""
    product = crud.get_product(db, article)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = replace(product, **payload.model_dump(exclude_unset=True))
    saved = crud.upsert_product(db, updated)
    return product_to_response(saved)


@app.delete("/products/{article}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    article: str,
    _: User = Depends(require_roles(Role.ADMIN, Role.MANAGER)),
    db: Session = Depends(get_db),
) -> None:
    """удаляем товар (admin/manager)."""
    if not crud.delete_product(db, article):
        raise HTTPException(status_code=404, detail="Product not found")


@app.get("/orders", response_model=list[OrderResponse])
def orders(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> list[OrderResponse]:
    """получаем заказы: admin/manager видят все, client — только свои."""
    if user.role in {Role.ADMIN, Role.MANAGER}:
        order_list = crud.list_all_orders(db)
    else:
        order_list = crud.list_orders_for_user(db, user.login)
    return [order_to_response(o, db) for o in order_list]


@app.get("/orders/me", response_model=list[OrderResponse])
def my_orders(
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> list[OrderResponse]:
    """получаем только свои заказы."""
    order_list = crud.list_orders_for_user(db, user.login)
    return [order_to_response(o, db) for o in order_list]


@app.post("/orders", response_model=OrderResponse)
def create_order(
    payload: OrderCreateRequest,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> OrderResponse:
    """создаём заказ, списываем остатки."""
    items = [(item.article, item.quantity) for item in payload.items]
    try:
        order = crud.create_order_in_db(db, user.login, items)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return order_to_response(order, db)


@app.patch("/orders/{number}", response_model=OrderResponse)
def update_order(
    number: int,
    payload: OrderUpdateRequest,
    _: User = Depends(require_roles(Role.ADMIN, Role.MANAGER)),
    db: Session = Depends(get_db),
) -> OrderResponse:
    """обновляем статус/дату доставки заказа (admin/manager)."""
    updated = crud.update_order_in_db(
        db,
        number,
        status=payload.status,
        delivery_date=payload.delivery_date,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_response(updated, db)
