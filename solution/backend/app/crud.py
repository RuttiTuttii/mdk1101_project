"""crud-операции для работы с sqlite базой через sqlalchemy."""

from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from typing import Sequence

from sqlalchemy import func as sa_func
from sqlalchemy.orm import Session

from .domain import Order, OrderItem, OrderStatus, Product, Role, User
from .models import (
    CategoryModel,
    ManufacturerModel,
    OrderItemModel,
    OrderModel,
    ProductModel,
    RoleModel,
    SupplierModel,
    UserModel,
)


# ─── вспомогательные функции преобразования ───


def _product_from_db(p: ProductModel) -> Product:
    """конвертируем orm-модель товара в доменный объект."""
    return Product(
        article=p.article,
        name=p.name,
        description=p.description or "",
        manufacturer=p.manufacturer.name if p.manufacturer else "",
        supplier=p.supplier.name if p.supplier else "",
        category=p.category.name if p.category else "",
        unit=p.unit,
        price=Decimal(str(p.price)),
        discount_percent=p.discount_percent,
        stock_count=p.stock_count,
        image_path=p.image_path,
    )


def _user_from_db(u: UserModel) -> User:
    """конвертируем orm-модель пользователя в доменный объект."""
    role_map = {"admin": Role.ADMIN, "manager": Role.MANAGER, "client": Role.CLIENT}
    return User(
        login=u.login,
        full_name=u.full_name,
        role=role_map.get(u.role.name, Role.CLIENT),
        password_hash=u.password_hash,
    )


def _order_from_db(o: OrderModel) -> Order:
    """конвертируем orm-модель заказа в доменный объект."""
    return Order(
        number=o.id,
        user_login=o.user.login if o.user else "",
        created_at=o.created_at,
        delivery_date=o.delivery_date,
        pickup_code=o.pickup_code,
        status=OrderStatus(o.status) if o.status in OrderStatus.__members__.values() else OrderStatus.NEW,
        items=[
            OrderItem(
                article=it.product_article,
                quantity=it.quantity,
                unit_price=Decimal(str(it.unit_price)),
            )
            for it in o.items
        ],
    )


# ─── роли ───


def get_or_create_role(db: Session, name: str) -> RoleModel:
    """получаем роль по имени, если нет — создаём."""
    role = db.query(RoleModel).filter_by(name=name).first()
    if not role:
        role = RoleModel(name=name)
        db.add(role)
        db.flush()
    return role


# ─── пользователи ───


def get_user_by_login(db: Session, login: str) -> User | None:
    """ищем пользователя по логину."""
    row = db.query(UserModel).filter_by(login=login).first()
    return _user_from_db(row) if row else None


def create_user(db: Session, user: User) -> User:
    """создаём нового пользователя в базе."""
    role = get_or_create_role(db, user.role.value)
    row = UserModel(
        login=user.login,
        full_name=user.full_name,
        role_id=role.id,
        password_hash=user.password_hash,
    )
    db.add(row)
    db.commit()
    return _user_from_db(row)


def list_users(db: Session) -> list[User]:
    """получаем всех пользователей."""
    rows = db.query(UserModel).all()
    return [_user_from_db(r) for r in rows]


# ─── справочники (категории, производители, поставщики) ───


def get_or_create_category(db: Session, name: str) -> CategoryModel:
    cat = db.query(CategoryModel).filter_by(name=name).first()
    if not cat:
        cat = CategoryModel(name=name)
        db.add(cat)
        db.flush()
    return cat


def get_or_create_manufacturer(db: Session, name: str) -> ManufacturerModel:
    m = db.query(ManufacturerModel).filter_by(name=name).first()
    if not m:
        m = ManufacturerModel(name=name)
        db.add(m)
        db.flush()
    return m


def get_or_create_supplier(db: Session, name: str) -> SupplierModel:
    s = db.query(SupplierModel).filter_by(name=name).first()
    if not s:
        s = SupplierModel(name=name)
        db.add(s)
        db.flush()
    return s


# ─── товары ───


def upsert_product(db: Session, product: Product) -> Product:
    """создаём или обновляем товар."""
    cat = get_or_create_category(db, product.category)
    mfr = get_or_create_manufacturer(db, product.manufacturer)
    sup = get_or_create_supplier(db, product.supplier)

    row = db.query(ProductModel).filter_by(article=product.article).first()
    if row:
        # обновляем существующий
        row.name = product.name
        row.description = product.description
        row.manufacturer_id = mfr.id
        row.supplier_id = sup.id
        row.category_id = cat.id
        row.unit = product.unit
        row.price = product.price
        row.discount_percent = product.discount_percent
        row.stock_count = product.stock_count
        row.image_path = product.image_path
    else:
        # создаём новый
        row = ProductModel(
            article=product.article,
            name=product.name,
            description=product.description,
            manufacturer_id=mfr.id,
            supplier_id=sup.id,
            category_id=cat.id,
            unit=product.unit,
            price=product.price,
            discount_percent=product.discount_percent,
            stock_count=product.stock_count,
            image_path=product.image_path,
        )
        db.add(row)
    db.commit()
    return _product_from_db(row)


def get_product(db: Session, article: str) -> Product | None:
    """получаем товар по артикулу."""
    row = db.query(ProductModel).filter_by(article=article).first()
    return _product_from_db(row) if row else None


def list_products(db: Session) -> list[Product]:
    """получаем все товары."""
    rows = db.query(ProductModel).all()
    return [_product_from_db(r) for r in rows]


def delete_product(db: Session, article: str) -> bool:
    """удаляем товар по артикулу."""
    row = db.query(ProductModel).filter_by(article=article).first()
    if not row:
        return False
    db.delete(row)
    db.commit()
    return True


def update_stock(db: Session, article: str, delta: int) -> bool:
    """изменяем остаток товара (delta может быть отрицательным)."""
    row = db.query(ProductModel).filter_by(article=article).first()
    if not row:
        return False
    new_count = row.stock_count + delta
    if new_count < 0:
        return False
    row.stock_count = new_count
    db.commit()
    return True


# ─── заказы ───


def create_order_in_db(
    db: Session,
    user_login: str,
    items: list[tuple[str, int]],
    created_at: date | None = None,
) -> Order:
    """создаём заказ в базе, списываем остатки."""
    user_row = db.query(UserModel).filter_by(login=user_login).first()
    if not user_row:
        raise ValueError(f"пользователь {user_login} не найден")

    # проверяем остатки
    for article, qty in items:
        prod = db.query(ProductModel).filter_by(article=article).first()
        if not prod:
            raise ValueError(f"товар {article} не найден")
        if prod.stock_count < qty:
            raise ValueError(f"недостаточно товара {article}: на складе {prod.stock_count}, запрошено {qty}")

    # генерируем код получения
    import random
    pickup_code = random.randint(100, 999)

    order_row = OrderModel(
        user_id=user_row.id,
        created_at=created_at or date.today(),
        delivery_date=(created_at or date.today()) + timedelta(days=7),
        pickup_code=pickup_code,
        status="new",
    )
    db.add(order_row)
    db.flush()

    # добавляем позиции и списываем остатки
    for article, qty in items:
        prod = db.query(ProductModel).filter_by(article=article).first()
        discounted = Decimal(str(prod.price)) * (1 - Decimal(prod.discount_percent) / 100)
        item_row = OrderItemModel(
            order_id=order_row.id,
            product_article=article,
            quantity=qty,
            unit_price=discounted.quantize(Decimal("0.01")),
        )
        db.add(item_row)
        prod.stock_count -= qty

    db.commit()
    return _order_from_db(order_row)


def list_orders_for_user(db: Session, user_login: str) -> list[Order]:
    """получаем заказы конкретного пользователя."""
    user_row = db.query(UserModel).filter_by(login=user_login).first()
    if not user_row:
        return []
    rows = db.query(OrderModel).filter_by(user_id=user_row.id).order_by(OrderModel.id.desc()).all()
    return [_order_from_db(r) for r in rows]


def list_all_orders(db: Session) -> list[Order]:
    """получаем все заказы (для админа/менеджера)."""
    rows = db.query(OrderModel).order_by(OrderModel.id.desc()).all()
    return [_order_from_db(r) for r in rows]


def get_order(db: Session, order_id: int) -> Order | None:
    """получаем заказ по номеру."""
    row = db.query(OrderModel).filter_by(id=order_id).first()
    return _order_from_db(row) if row else None


def update_order_in_db(
    db: Session,
    order_id: int,
    status: str | None = None,
    delivery_date: date | None = None,
) -> Order | None:
    """обновляем статус и/или дату доставки заказа."""
    row = db.query(OrderModel).filter_by(id=order_id).first()
    if not row:
        return None
    if status:
        row.status = status
    if delivery_date:
        row.delivery_date = delivery_date
    db.commit()
    return _order_from_db(row)


# ─── производители (для фильтра) ───


def list_manufacturer_names(db: Session) -> list[str]:
    """получаем отсортированный список имён производителей."""
    rows = db.query(ManufacturerModel).order_by(ManufacturerModel.name).all()
    return [r.name for r in rows]
