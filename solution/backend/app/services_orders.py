from __future__ import annotations

from dataclasses import replace
from datetime import date
from decimal import Decimal
from typing import Iterable

from .domain import Order, OrderItem, OrderStatus, Product, default_delivery_date, generate_pickup_code


def create_order(
    number: int,
    user_login: str,
    lines: list[tuple[str, int]],
    products: Iterable[Product],
    created_at: date | None = None,
) -> Order:
    catalog = {product.article: product for product in products}
    items: list[OrderItem] = []
    for article, quantity in lines:
        product = catalog[article]
        items.append(OrderItem(article=article, quantity=quantity, unit_price=product.discounted_price))

    return Order(
        number=number,
        user_login=user_login,
        created_at=created_at or date.today(),
        delivery_date=default_delivery_date(created_at),
        pickup_code=generate_pickup_code(number),
        status=OrderStatus.NEW,
        items=items,
    )


def update_order(order: Order, *, status: OrderStatus | None = None, delivery_date: date | None = None) -> Order:
    return replace(
        order,
        status=status or order.status,
        delivery_date=delivery_date or order.delivery_date,
    )


def order_total(order: Order) -> Decimal:
    return order.total

