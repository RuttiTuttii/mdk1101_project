from __future__ import annotations

from decimal import Decimal
from typing import Iterable

from .domain import CatalogQuery, Product, apply_catalog_query


def list_catalog(products: Iterable[Product], query: CatalogQuery) -> list[Product]:
    return apply_catalog_query(products, query)


def unique_manufacturers(products: Iterable[Product]) -> list[str]:
    return sorted({product.manufacturer for product in products})


def catalog_min_price(products: Iterable[Product]) -> Decimal | None:
    prices = [product.discounted_price for product in products]
    return min(prices) if prices else None

