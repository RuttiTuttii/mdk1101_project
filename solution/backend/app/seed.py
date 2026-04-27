"""скрипт заполнения sqlite базы данных из excel-файлов импорта."""

from __future__ import annotations

import sys
from pathlib import Path

# добавляем корень проекта в путь
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))

from app.database import SessionLocal, init_db
from app.crud import (
    create_order_in_db,
    get_or_create_role,
    upsert_product,
    create_user,
)
from app.domain import Product, Role, User
from app.importer import load_dataset


def seed():
    """заполняем базу данных из excel."""
    # инициализируем таблицы
    init_db()
    db = SessionLocal()

    try:
        # создаём роли
        for role_name in ["admin", "manager", "client"]:
            get_or_create_role(db, role_name)
        db.commit()

        # загружаем данные из excel
        # ищем папку с импортом (с кириллическим названием)
        import_dir = None
        project_dir = Path(__file__).resolve().parents[3]
        for d in project_dir.iterdir():
            if d.is_dir():
                test_file = d / "import" / "Tovar.xlsx"
                if test_file.exists():
                    import_dir = test_file.parent
                    break
        if not import_dir:
            print(f"папка импорта не найдена: {import_dir}")
            return

        dataset = load_dataset(import_dir)

        # заполняем товары
        print(f"импортируем {len(dataset.products)} товаров...")
        for p in dataset.products:
            upsert_product(db, p)

        # заполняем пользователей
        print(f"импортируем {len(dataset.users)} пользователей...")
        for u in dataset.users:
            create_user(db, u)

        # заполняем заказы
        print(f"импортируем {len(dataset.orders)} заказов...")
        for order in dataset.orders:
            try:
                create_order_in_db(
                    db,
                    user_login=order.user_login,
                    items=[(it.article, it.quantity) for it in order.items],
                    created_at=order.created_at,
                )
            except Exception as e:
                print(f"  пропускаем заказ {order.number}: {e}")

        print("импорт завершён!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
