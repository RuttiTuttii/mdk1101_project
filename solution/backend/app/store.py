from __future__ import annotations

from dataclasses import dataclass, replace
from datetime import date
from pathlib import Path
from types import SimpleNamespace

from .domain import Order, OrderItem, OrderStatus, Product, Role, User
from .importer import load_dataset
from .sample_data import ORDERS, PRODUCTS, USERS
from .services_orders import create_order


@dataclass
class AppStore:
    products: dict[str, Product]
    users: dict[str, User]
    orders: dict[int, Order]
    next_order_number: int

    @classmethod
    def from_seed(cls) -> "AppStore":
        imported = _load_imported_dataset()
        products = imported.products or PRODUCTS
        users = imported.users or USERS
        orders_source = imported.orders or ORDERS
        orders = {order.number: order for order in orders_source}
        return cls(
            products={product.article: product for product in products},
            users={user.login: user for user in users},
            orders=orders,
            next_order_number=(max(orders) + 1) if orders else 1,
        )

    def get_product(self, article: str) -> Product:
        return self.products[article]

    def upsert_product(self, product: Product) -> Product:
        self.products[product.article] = product
        return product

    def delete_product(self, article: str) -> None:
        self.products.pop(article, None)

    def get_user(self, login: str) -> User | None:
        return self.users.get(login)

    def register_user(self, user: User) -> User:
        self.users[user.login] = user
        return user

    def add_order(self, order: Order) -> Order:
        self.orders[order.number] = order
        self.next_order_number = max(self.next_order_number, order.number + 1)
        return order

    def create_order_for_user(self, login: str, items: list[tuple[str, int]]) -> Order:
        # проверяем остатки перед созданием заказа
        for article, quantity in items:
            product = self.products.get(article)
            if not product:
                raise ValueError(f"товар {article} не найден")
            if product.stock_count < quantity:
                raise ValueError(f"недостаточно товара {article}: на складе {product.stock_count}, запрошено {quantity}")

        # создаём заказ
        order = create_order(
            number=self.next_order_number,
            user_login=login,
            lines=items,
            products=self.products.values(),
            created_at=date.today(),
        )

        # списываем остатки
        for article, quantity in items:
            product = self.products[article]
            self.products[article] = replace(product, stock_count=product.stock_count - quantity)

        return self.add_order(order)

    def update_order(self, number: int, *, status: OrderStatus | None = None, delivery_date: date | None = None) -> Order:
        order = self.orders[number]
        updated = replace(
            order,
            status=status or order.status,
            delivery_date=delivery_date or order.delivery_date,
        )
        self.orders[number] = updated
        return updated


def _load_imported_dataset():
    # ищем папку с импортом (с кириллическим названием)
    solution_dir = Path(__file__).resolve().parents[3]
    import_dir = None
    for d in solution_dir.iterdir():
        if d.is_dir():
            test_file = d / "import" / "Tovar.xlsx"
            if test_file.exists():
                import_dir = test_file.parent
                break
    if import_dir:
        try:
            return load_dataset(import_dir)
        except Exception:
            pass
    return SimpleNamespace(products=[], users=[], orders=[])


STORE = AppStore.from_seed()
