"""тесты api обувного магазина."""

from __future__ import annotations

import sys
from decimal import Decimal
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

# добавляем корень бэкенда в путь
root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root))

from app.main import app
from app.database import init_db, SessionLocal, engine, Base
from app.models import *  # noqa — иморт чтобы Base знал о моделях


@pytest.fixture(autouse=True)
def setup_db():
    """создаём чистую базу перед каждым тестом."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """тестовый клиент fastapi."""
    return TestClient(app)


@pytest.fixture
def auth_headers(client):
    """получаем токен для тестового пользователя."""
    resp = client.post("/auth/register", json={
        "login": "test@test.com",
        "full_name": "Тест Тестов",
        "password": "pass123",
        "role": "client",
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client):
    """получаем токен для админа."""
    resp = client.post("/auth/register", json={
        "login": "admin@test.com",
        "full_name": "Админ Админов",
        "password": "admin123",
        "role": "admin",
    })
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ─── тесты здоровья ───


def test_health(client):
    """проверяем что api отвечает."""
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ─── тесты авторизации ───


def test_register_and_login(client):
    """регистрация и вход работают."""
    # регистрация
    resp = client.post("/auth/register", json={
        "login": "user@test.com",
        "full_name": "Иван Иванов",
        "password": "secret",
        "role": "client",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["full_name"] == "Иван Иванов"
    assert data["role"] == "client"

    # вход
    resp = client.post("/auth/login", json={
        "login": "user@test.com",
        "password": "secret",
    })
    assert resp.status_code == 200
    assert resp.json()["login"] == "user@test.com"


def test_register_duplicate(client):
    """нельзя зарегистрироваться дважды с тем же логином."""
    client.post("/auth/register", json={
        "login": "dup@test.com",
        "full_name": "Дубль",
        "password": "pass",
    })
    resp = client.post("/auth/register", json={
        "login": "dup@test.com",
        "full_name": "Дубль 2",
        "password": "pass",
    })
    assert resp.status_code == 409


def test_login_wrong_password(client):
    """неверный пароль — 401."""
    client.post("/auth/register", json={
        "login": "user2@test.com",
        "full_name": "Тест",
        "password": "correct",
    })
    resp = client.post("/auth/login", json={
        "login": "user2@test.com",
        "password": "wrong",
    })
    assert resp.status_code == 401


def test_me_endpoint(client, auth_headers):
    """эндпоинт /auth/me возвращает данные текущего пользователя."""
    resp = client.get("/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["login"] == "test@test.com"


# ─── тесты каталога ───


def test_catalog_empty(client):
    """пустой каталог возвращает пустой список."""
    resp = client.get("/catalog")
    assert resp.status_code == 200
    assert resp.json() == []


def test_manufacturers_empty(client):
    """без товаров — пустой список производителей."""
    resp = client.get("/manufacturers")
    assert resp.status_code == 200
    assert resp.json() == []


# ─── тесты товаров ───


def test_product_crud(client, admin_headers):
    """создание, получение, обновление, удаление товара."""
    # создаём товар
    product_data = {
        "article": "TEST001",
        "name": "Тестовые ботинки",
        "description": "Описание тестовых ботинок",
        "manufacturer": "TestBrand",
        "supplier": "TestSupplier",
        "category": "Ботинки",
        "unit": "шт",
        "price": 5000,
        "discount_percent": 10,
        "stock_count": 5,
    }
    resp = client.post("/products", json=product_data, headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["article"] == "TEST001"
    assert Decimal(str(data["discounted_price"])) == Decimal("4500.00")
    assert data["has_discount"] is True
    assert data["in_stock"] is True

    # получаем по артикулу
    resp = client.get("/products/TEST001")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Тестовые ботинки"

    # обновляем
    resp = client.patch("/products/TEST001", json={"price": 4000}, headers=admin_headers)
    assert resp.status_code == 200
    assert Decimal(str(resp.json()["price"])) == Decimal("4000")

    # удаляем
    resp = client.delete("/products/TEST001", headers=admin_headers)
    assert resp.status_code == 204

    # проверяем что удалён
    resp = client.get("/products/TEST001")
    assert resp.status_code == 404


def test_product_create_requires_auth(client):
    """создать товар может только авторизованный admin/manager."""
    resp = client.post("/products", json={
        "article": "X",
        "name": "X",
        "description": "X",
        "manufacturer": "X",
        "supplier": "X",
        "category": "X",
        "unit": "шт",
        "price": 100,
        "discount_percent": 0,
        "stock_count": 1,
    })
    assert resp.status_code == 401


def test_client_cannot_create_product(client, auth_headers):
    """клиент не может создавать товары."""
    resp = client.post("/products", json={
        "article": "X",
        "name": "X",
        "description": "X",
        "manufacturer": "X",
        "supplier": "X",
        "category": "X",
        "unit": "шт",
        "price": 100,
        "discount_percent": 0,
        "stock_count": 1,
    }, headers=auth_headers)
    assert resp.status_code == 403


# ─── тесты заказов ───


def _create_test_product(client, admin_headers, article="P001", stock=10):
    """вспомогательная функция — создаём тестовый товар."""
    client.post("/products", json={
        "article": article,
        "name": f"Товар {article}",
        "description": "Тестовый товар",
        "manufacturer": "Brand",
        "supplier": "Supplier",
        "category": "Категория",
        "unit": "шт",
        "price": 1000,
        "discount_percent": 0,
        "stock_count": stock,
    }, headers=admin_headers)


def test_create_order(client, auth_headers, admin_headers):
    """создание заказа списывает остатки."""
    _create_test_product(client, admin_headers, stock=5)

    resp = client.post("/orders", json={
        "items": [{"article": "P001", "quantity": 2}]
    }, headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "new"
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 2

    # проверяем что остаток уменьшился
    resp = client.get("/products/P001")
    assert resp.json()["stock_count"] == 3


def test_order_insufficient_stock(client, auth_headers, admin_headers):
    """нельзя заказать больше, чем есть на складе."""
    _create_test_product(client, admin_headers, stock=2)

    resp = client.post("/orders", json={
        "items": [{"article": "P001", "quantity": 5}]
    }, headers=auth_headers)
    assert resp.status_code == 400
    assert "недостаточно" in resp.json()["detail"].lower()


def test_order_nonexistent_product(client, auth_headers):
    """нельзя заказать несуществующий товар."""
    resp = client.post("/orders", json={
        "items": [{"article": "FAKE", "quantity": 1}]
    }, headers=auth_headers)
    assert resp.status_code == 400


def test_my_orders(client, auth_headers, admin_headers):
    """клиент видит только свои заказы."""
    _create_test_product(client, admin_headers, stock=10)

    # создаём заказ
    client.post("/orders", json={
        "items": [{"article": "P001", "quantity": 1}]
    }, headers=auth_headers)

    # получаем свои заказы
    resp = client.get("/orders/me", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_admin_sees_all_orders(client, auth_headers, admin_headers):
    """admin видит все заказы."""
    _create_test_product(client, admin_headers, stock=10)

    # клиент создаёт заказ
    client.post("/orders", json={
        "items": [{"article": "P001", "quantity": 1}]
    }, headers=auth_headers)

    # admin видит все заказы
    resp = client.get("/orders", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_update_order_status(client, auth_headers, admin_headers):
    """admin может менять статус заказа."""
    _create_test_product(client, admin_headers, stock=10)

    # создаём заказ
    resp = client.post("/orders", json={
        "items": [{"article": "P001", "quantity": 1}]
    }, headers=auth_headers)
    order_number = resp.json()["number"]

    # admin меняет статус
    resp = client.patch(f"/orders/{order_number}", json={
        "status": "processing"
    }, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "processing"


def test_client_cannot_update_order(client, auth_headers, admin_headers):
    """клиент не может менять статус заказа."""
    _create_test_product(client, admin_headers, stock=10)

    resp = client.post("/orders", json={
        "items": [{"article": "P001", "quantity": 1}]
    }, headers=auth_headers)
    order_number = resp.json()["number"]

    resp = client.patch(f"/orders/{order_number}", json={
        "status": "done"
    }, headers=auth_headers)
    assert resp.status_code == 403


# ─── тесты домена ───


def test_product_discounted_price():
    """проверяем расчёт цены со скидкой."""
    from app.domain import Product
    from decimal import Decimal

    p = Product(
        article="T", name="T", description="", manufacturer="",
        supplier="", category="", unit="шт",
        price=Decimal("1000"), discount_percent=20,
    )
    assert p.discounted_price == Decimal("800.00")
    assert p.has_discount is True
    assert p.in_stock is False  # stock_count = 0

    p.stock_count = 5
    assert p.in_stock is True


def test_catalog_query_filters():
    """проверяем фильтрацию каталога."""
    from app.domain import Product, CatalogQuery, apply_catalog_query, SortKey
    from decimal import Decimal

    products = [
        Product(article="A", name="Ботинки", description="зимние ботинки",
                manufacturer="Brand1", supplier="Sup1", category="Обувь", unit="шт",
                price=Decimal("3000"), discount_percent=10, stock_count=5),
        Product(article="B", name="Сапоги", description="осенние сапоги",
                manufacturer="Brand2", supplier="Sup2", category="Обувь", unit="шт",
                price=Decimal("5000"), discount_percent=0, stock_count=0),
    ]

    # фильтр по поиску
    q = CatalogQuery(search="зимние")
    result = apply_catalog_query(products, q)
    assert len(result) == 1
    assert result[0].article == "A"

    # фильтр по производителю
    q = CatalogQuery(manufacturer="Brand1")
    result = apply_catalog_query(products, q)
    assert len(result) == 1

    # фильтр только со скидкой
    q = CatalogQuery(only_discounted=True)
    result = apply_catalog_query(products, q)
    assert len(result) == 1
    assert result[0].article == "A"

    # фильтр только в наличии
    q = CatalogQuery(only_in_stock=True)
    result = apply_catalog_query(products, q)
    assert len(result) == 1
    assert result[0].article == "A"

    # сортировка по цене
    q = CatalogQuery(sort_by=SortKey.PRICE)
    result = apply_catalog_query(products, q)
    assert result[0].article == "A"  # дешевле со скидкой
