"""настройка подключения к sqlite через sqlalchemy."""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# файл базы лежит рядом с папкой backend
DB_PATH = Path(__file__).resolve().parents[1] / "shoe_store.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """базовый класс для всех orm-моделей."""
    pass


def get_db():
    """генератор сессии для dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """создаём все таблицы (если ещё не существуют)."""
    from . import models  # noqa: F401 — импорт нужен чтобы Base знал о моделях
    Base.metadata.create_all(bind=engine)
