from __future__ import annotations

from datetime import date
from decimal import Decimal

from pydantic import BaseModel, Field

from .domain import OrderStatus, Role, SortKey


class LoginRequest(BaseModel):
    login: str
    password: str


class RegisterRequest(BaseModel):
    full_name: str
    login: str
    password: str
    role: Role = Role.CLIENT


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    full_name: str
    role: Role
    login: str


class MeResponse(BaseModel):
    login: str
    full_name: str
    role: Role


class ProductBase(BaseModel):
    article: str
    name: str
    description: str
    manufacturer: str
    supplier: str
    category: str
    unit: str
    price: Decimal
    max_discount_percent: int = Field(default=0, ge=0, le=100)
    discount_percent: int = Field(default=0, ge=0, le=100)
    stock_count: int = Field(default=0, ge=0)
    image_path: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    manufacturer: str | None = None
    supplier: str | None = None
    category: str | None = None
    unit: str | None = None
    price: Decimal | None = None
    max_discount_percent: int | None = Field(default=None, ge=0, le=100)
    discount_percent: int | None = Field(default=None, ge=0, le=100)
    stock_count: int | None = Field(default=None, ge=0)
    image_path: str | None = None


class ProductResponse(ProductBase):
    discounted_price: Decimal
    has_discount: bool
    in_stock: bool


class OrderItemRequest(BaseModel):
    article: str
    quantity: int = Field(ge=1)


class OrderItemResponse(BaseModel):
    article: str
    quantity: int
    unit_price: Decimal
    total: Decimal


class OrderCreateRequest(BaseModel):
    items: list[OrderItemRequest]


class OrderUpdateRequest(BaseModel):
    status: OrderStatus | None = None
    delivery_date: date | None = None


class OrderResponse(BaseModel):
    number: int
    user_login: str
    user_full_name: str
    created_at: date
    delivery_date: date
    pickup_code: int
    status: OrderStatus
    total: Decimal
    items: list[OrderItemResponse]


class CatalogQueryResponse(ProductResponse):
    pass


class PaginatedCatalogResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int

