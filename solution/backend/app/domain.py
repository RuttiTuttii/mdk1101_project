from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from enum import StrEnum
from typing import Iterable


class Role(StrEnum):
    ADMIN = "admin"
    MANAGER = "manager"
    CLIENT = "client"


class OrderStatus(StrEnum):
    NEW = "new"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DONE = "done"
    CANCELED = "canceled"


class SortKey(StrEnum):
    NAME = "name"
    SUPPLIER = "supplier"
    PRICE = "price"
    PRICE_DESC = "price_desc"


@dataclass(slots=True)
class Product:
    article: str
    name: str
    description: str
    manufacturer: str
    supplier: str
    category: str
    unit: str
    price: Decimal
    discount_percent: int = 0
    stock_count: int = 0
    image_path: str | None = None

    @property
    def discounted_price(self) -> Decimal:
        discount = Decimal(self.discount_percent) / Decimal(100)
        price = self.price * (Decimal(1) - discount)
        return price.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def has_discount(self) -> bool:
        return self.discount_percent > 0

    @property
    def in_stock(self) -> bool:
        return self.stock_count > 0

    def matches_description(self, query: str) -> bool:
        if not query:
            return True
        return query.casefold() in self.description.casefold()


@dataclass(slots=True)
class User:
    login: str
    full_name: str
    role: Role
    password_hash: str = ""


@dataclass(slots=True)
class OrderItem:
    article: str
    quantity: int
    unit_price: Decimal

    @property
    def total(self) -> Decimal:
        return (self.unit_price * self.quantity).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass(slots=True)
class Order:
    number: int
    user_login: str
    created_at: date
    delivery_date: date
    pickup_code: int
    status: OrderStatus
    items: list[OrderItem] = field(default_factory=list)

    @property
    def total(self) -> Decimal:
        total = sum((item.total for item in self.items), Decimal("0"))
        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@dataclass(slots=True)
class CatalogQuery:
    search: str = ""
    manufacturer: str | None = None
    max_price: Decimal | None = None
    only_discounted: bool = False
    only_in_stock: bool = False
    sort_by: SortKey = SortKey.NAME


def apply_catalog_query(products: Iterable[Product], query: CatalogQuery) -> list[Product]:
    items = list(products)
    if query.search:
        items = [p for p in items if p.matches_description(query.search)]
    if query.manufacturer and query.manufacturer != "all":
        items = [p for p in items if p.manufacturer == query.manufacturer]
    if query.max_price is not None:
        items = [p for p in items if p.discounted_price <= query.max_price]
    if query.only_discounted:
        items = [p for p in items if p.has_discount]
    if query.only_in_stock:
        items = [p for p in items if p.in_stock]

    if query.sort_by == SortKey.NAME:
        items.sort(key=lambda p: (p.name.casefold(), p.article))
    elif query.sort_by == SortKey.SUPPLIER:
        items.sort(key=lambda p: (p.supplier.casefold(), p.article))
    elif query.sort_by == SortKey.PRICE:
        items.sort(key=lambda p: (p.discounted_price, p.article))
    elif query.sort_by == SortKey.PRICE_DESC:
        items.sort(key=lambda p: (p.discounted_price, p.article), reverse=True)
    return items


def generate_pickup_code(seed: int | None = None) -> int:
    base = seed if seed is not None else int(datetime.now().timestamp())
    return 100 + base % 900


def default_delivery_date(created_at: date | None = None) -> date:
    return (created_at or date.today()) + timedelta(days=7)

