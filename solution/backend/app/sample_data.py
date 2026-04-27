from __future__ import annotations

from datetime import date
from decimal import Decimal

from .domain import Order, OrderItem, OrderStatus, Product, Role, User

PRODUCTS = [
    Product(
        article="A112T4",
        name="Boots",
        description="Women's demi-season boots",
        manufacturer="Kari",
        supplier="Kari",
        category="Women's shoes",
        unit="pcs",
        price=Decimal("4990"),
        discount_percent=3,
        stock_count=6,
        image_path="1.jpg",
    ),
    Product(
        article="F635R4",
        name="Boots",
        description="Women's boots by Marco Tozzi",
        manufacturer="Marco Tozzi",
        supplier="Обувь для вас",
        category="Women's shoes",
        unit="pcs",
        price=Decimal("3244"),
        discount_percent=2,
        stock_count=13,
        image_path="2.jpg",
    ),
]

USERS = [
    User(login="client@example.com", full_name="Client User", role=Role.CLIENT, password_hash="client"),
    User(login="manager@example.com", full_name="Manager User", role=Role.MANAGER, password_hash="manager"),
    User(login="admin@example.com", full_name="Admin User", role=Role.ADMIN, password_hash="admin"),
]

ORDERS = [
    Order(
        number=1,
        user_login="client@example.com",
        created_at=date.today(),
        delivery_date=date.today(),
        pickup_code=101,
        status=OrderStatus.NEW,
        items=[OrderItem(article="A112T4", quantity=1, unit_price=PRODUCTS[0].discounted_price)],
    )
]

