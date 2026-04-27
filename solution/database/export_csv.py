"""генерация csv-файлов из excel для экспорта таблиц базы данных."""

from __future__ import annotations

import csv
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(root))

from app.importer import load_dataset


def export_csv(rows: list[dict], output_path: Path):
    """записываем список словарей в csv-файл."""
    if not rows:
        return
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    print(f"  сохранено: {output_path} ({len(rows)} строк)")


def main():
    # ищем папку с импортом (с кириллическим названием)
    project_dir = Path(__file__).resolve().parents[2]
    import_dir = None
    for d in project_dir.iterdir():
        if d.is_dir():
            test_file = d / "import" / "Tovar.xlsx"
            if test_file.exists():
                import_dir = test_file.parent
                break
    if not import_dir:
        print("папка импорта не найдена!")
        return
    exports_dir = Path(__file__).resolve().parent / "exports"
    exports_dir.mkdir(parents=True, exist_ok=True)

    print("загружаем данные из excel...")
    dataset = load_dataset(import_dir)

    # экспортируем товары
    products_rows = []
    for p in dataset.products:
        products_rows.append({
            "article": p.article,
            "name": p.name,
            "description": p.description,
            "manufacturer": p.manufacturer,
            "supplier": p.supplier,
            "category": p.category,
            "unit": p.unit,
            "price": str(p.price),
            "discount_percent": p.discount_percent,
            "stock_count": p.stock_count,
            "image_path": p.image_path or "",
        })
    export_csv(products_rows, exports_dir / "products.csv")

    # экспортируем пользователей
    users_rows = []
    for u in dataset.users:
        users_rows.append({
            "login": u.login,
            "full_name": u.full_name,
            "role": u.role.value,
            "password_hash": u.password_hash,
        })
    export_csv(users_rows, exports_dir / "users.csv")

    # экспортируем заказы (заголовки)
    orders_rows = []
    for o in dataset.orders:
        orders_rows.append({
            "number": o.number,
            "user_login": o.user_login,
            "created_at": str(o.created_at),
            "delivery_date": str(o.delivery_date),
            "pickup_code": o.pickup_code,
            "status": o.status.value,
        })
    export_csv(orders_rows, exports_dir / "orders.csv")

    # экспортируем позиции заказов
    order_items_rows = []
    for o in dataset.orders:
        for it in o.items:
            order_items_rows.append({
                "order_number": o.number,
                "article": it.article,
                "quantity": it.quantity,
                "unit_price": str(it.unit_price),
            })
    export_csv(order_items_rows, exports_dir / "order_items.csv")

    # экспортируем справочники
    categories = sorted({p.category for p in dataset.products})
    export_csv([{"id": i+1, "name": c} for i, c in enumerate(categories)], exports_dir / "categories.csv")

    manufacturers = sorted({p.manufacturer for p in dataset.products})
    export_csv([{"id": i+1, "name": m} for i, m in enumerate(manufacturers)], exports_dir / "manufacturers.csv")

    suppliers = sorted({p.supplier for p in dataset.products})
    export_csv([{"id": i+1, "name": s} for i, s in enumerate(suppliers)], exports_dir / "suppliers.csv")

    roles = [{"id": 1, "name": "admin"}, {"id": 2, "name": "manager"}, {"id": 3, "name": "client"}]
    export_csv(roles, exports_dir / "roles.csv")

    print("экспорт завершён!")


if __name__ == "__main__":
    main()
