"""orm-модели для sqlite базы данных обувного магазина."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class RoleModel(Base):
    """таблица ролей пользователей (admin, manager, client)."""
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    # связь с пользователями
    users: Mapped[list["UserModel"]] = relationship(back_populates="role")


class UserModel(Base):
    """таблица пользователей системы."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    login: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # связи
    role: Mapped["RoleModel"] = relationship(back_populates="users")
    orders: Mapped[list["OrderModel"]] = relationship(back_populates="user")


class CategoryModel(Base):
    """таблица категорий товаров."""
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    products: Mapped[list["ProductModel"]] = relationship(back_populates="category")


class ManufacturerModel(Base):
    """таблица производителей."""
    __tablename__ = "manufacturers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    products: Mapped[list["ProductModel"]] = relationship(back_populates="manufacturer")


class SupplierModel(Base):
    """таблица поставщиков."""
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)

    products: Mapped[list["ProductModel"]] = relationship(back_populates="supplier")


class ProductModel(Base):
    """таблица товаров (обуви)."""
    __tablename__ = "products"

    article: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    manufacturer_id: Mapped[int] = mapped_column(Integer, ForeignKey("manufacturers.id"), nullable=False)
    supplier_id: Mapped[int] = mapped_column(Integer, ForeignKey("suppliers.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(Integer, ForeignKey("categories.id"), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="шт")
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percent: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    stock_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # связи
    manufacturer: Mapped["ManufacturerModel"] = relationship(back_populates="products")
    supplier: Mapped["SupplierModel"] = relationship(back_populates="products")
    category: Mapped["CategoryModel"] = relationship(back_populates="products")
    order_items: Mapped[list["OrderItemModel"]] = relationship(back_populates="product")


class OrderModel(Base):
    """таблица заказов."""
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    delivery_date: Mapped[date] = mapped_column(Date, nullable=False)
    pickup_code: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="new")

    # связи
    user: Mapped["UserModel"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItemModel"]] = relationship(back_populates="order", cascade="all, delete-orphan")


class OrderItemModel(Base):
    """таблица позиций заказа."""
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"), nullable=False)
    product_article: Mapped[str] = mapped_column(String(50), ForeignKey("products.article"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    # связи
    order: Mapped["OrderModel"] = relationship(back_populates="items")
    product: Mapped["ProductModel"] = relationship(back_populates="order_items")
