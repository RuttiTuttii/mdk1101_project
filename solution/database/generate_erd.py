"""генерация er-диаграммы базы данных в формате png через pillow."""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


# цветовая схема
BG_COLOR = "#FFFFFF"
TABLE_BG = "#E8F5E9"
TABLE_HEADER = "#2E8B57"
TEXT_COLOR = "#1a1a1a"
HEADER_TEXT = "#FFFFFF"
LINE_COLOR = "#2E8B57"
FK_COLOR = "#FF6B35"

# размеры
CELL_H = 22
TABLE_W = 280
PADDING = 12
COL_GAP = 60
ROW_GAP = 80


def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_table(draw, x, y, name, columns, font, header_font):
    """рисуем одну таблицу."""
    # высота таблицы: заголовок + колонки
    h = CELL_H + len(columns) * CELL_H + PADDING * 2

    # фон таблицы
    draw.rounded_rectangle([x, y, x + TABLE_W, y + h], radius=8, fill=TABLE_BG, outline=TABLE_HEADER, width=2)

    # заголовок
    draw.rectangle([x, y, x + TABLE_W, y + CELL_H + PADDING], fill=TABLE_HEADER)
    tw, _ = text_size(draw, name, header_font)
    draw.text((x + (TABLE_W - tw) // 2, y + PADDING // 2), name, fill=HEADER_TEXT, font=header_font)

    # колонки
    cy = y + CELL_H + PADDING
    for col_name, col_type, is_pk, is_fk in columns:
        prefix = ""
        color = TEXT_COLOR
        if is_pk:
            prefix = "PK "
            color = TABLE_HEADER
        if is_fk:
            prefix += "FK "
            color = FK_COLOR
        draw.text((x + PADDING, cy + 3), f"{prefix}{col_name}", fill=color, font=font)
        # тип справа
        tw2, _ = text_size(draw, col_type, font)
        draw.text((x + TABLE_W - PADDING - tw2, cy + 3), col_type, fill="#666", font=font)
        cy += CELL_H

    return h


def draw_arrow(draw, x1, y1, x2, y2):
    """рисуем линию связи."""
    draw.line([(x1, y1), (x2, y2)], fill=LINE_COLOR, width=2)
    # стрелка
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_len = 10
    ax = x2 - arrow_len * math.cos(angle - 0.4)
    ay = y2 - arrow_len * math.sin(angle - 0.4)
    bx = x2 - arrow_len * math.cos(angle + 0.4)
    by = y2 - arrow_len * math.sin(angle + 0.4)
    draw.polygon([(x2, y2), (int(ax), int(ay)), (int(bx), int(by))], fill=LINE_COLOR)


def main():
    # определяем таблицы
    tables = {
        "roles": [
            ("id", "INTEGER", True, False),
            ("name", "VARCHAR(50)", False, False),
        ],
        "users": [
            ("id", "INTEGER", True, False),
            ("login", "VARCHAR(255)", False, False),
            ("full_name", "VARCHAR(255)", False, False),
            ("role_id", "INTEGER", False, True),
            ("password_hash", "VARCHAR(255)", False, False),
        ],
        "categories": [
            ("id", "INTEGER", True, False),
            ("name", "VARCHAR(255)", False, False),
        ],
        "manufacturers": [
            ("id", "INTEGER", True, False),
            ("name", "VARCHAR(255)", False, False),
        ],
        "suppliers": [
            ("id", "INTEGER", True, False),
            ("name", "VARCHAR(255)", False, False),
        ],
        "products": [
            ("article", "VARCHAR(50)", True, False),
            ("name", "VARCHAR(255)", False, False),
            ("description", "TEXT", False, False),
            ("manufacturer_id", "INTEGER", False, True),
            ("supplier_id", "INTEGER", False, True),
            ("category_id", "INTEGER", False, True),
            ("unit", "VARCHAR(50)", False, False),
            ("price", "NUMERIC(10,2)", False, False),
            ("discount_percent", "INTEGER", False, False),
            ("stock_count", "INTEGER", False, False),
            ("image_path", "VARCHAR(500)", False, False),
        ],
        "orders": [
            ("id", "INTEGER", True, False),
            ("user_id", "INTEGER", False, True),
            ("created_at", "DATE", False, False),
            ("delivery_date", "DATE", False, False),
            ("pickup_code", "INTEGER", False, False),
            ("status", "VARCHAR(50)", False, False),
        ],
        "order_items": [
            ("id", "INTEGER", True, False),
            ("order_id", "INTEGER", False, True),
            ("product_article", "VARCHAR(50)", False, True),
            ("quantity", "INTEGER", False, False),
            ("unit_price", "NUMERIC(10,2)", False, False),
        ],
    }

    # позиции таблиц на холсте
    positions = {
        "roles": (50, 50),
        "users": (50, 250),
        "categories": (400, 50),
        "manufacturers": (400, 200),
        "suppliers": (400, 370),
        "products": (750, 50),
        "orders": (50, 500),
        "order_items": (400, 550),
    }

    # связи (from, to)
    edges = [
        ("roles", "users"),
        ("users", "orders"),
        ("categories", "products"),
        ("manufacturers", "products"),
        ("suppliers", "products"),
        ("products", "order_items"),
        ("orders", "order_items"),
    ]

    # шрифт
    try:
        font = ImageFont.truetype("arial.ttf", 12)
        header_font = ImageFont.truetype("arialbd.ttf", 13)
    except OSError:
        font = ImageFont.load_default()
        header_font = font

    # размер холста
    img_w, img_h = 1200, 800
    img = Image.new("RGB", (img_w, img_h), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # заголовок
    try:
        title_font = ImageFont.truetype("arialbd.ttf", 18)
    except OSError:
        title_font = font
    draw.text((img_w // 2 - 150, 10), "ER-диаграмма: Обувной магазин", fill=TABLE_HEADER, font=title_font)

    # рисуем таблицы и запоминаем координаты
    table_boxes = {}
    for name, columns in tables.items():
        x, y = positions[name]
        h = draw_table(draw, x, y, name, columns, font, header_font)
        table_boxes[name] = (x, y, TABLE_W, h)

    # рисуем связи
    for src, dst in edges:
        sx, sy, sw, sh = table_boxes[src]
        dx, dy, dw, dh = table_boxes[dst]
        # центры таблиц
        cx1 = sx + sw
        cy1 = sy + sh // 2
        cx2 = dx
        cy2 = dy + dh // 2
        # если источник правее — корректируем
        if sx > dx:
            cx1 = sx
            cx2 = dx + dw
        draw_arrow(draw, cx1, cy1, cx2, cy2)

    # легенда
    lx, ly = 50, img_h - 60
    draw.rectangle([lx, ly, lx + 15, ly + 15], fill=TABLE_HEADER)
    draw.text((lx + 20, ly), "— первичный ключ (PK)", fill=TEXT_COLOR, font=font)
    draw.rectangle([lx + 220, ly, lx + 235, ly + 15], fill=FK_COLOR)
    draw.text((lx + 240, ly), "— внешний ключ (FK)", fill=TEXT_COLOR, font=font)

    # сохраняем
    output_path = Path(__file__).resolve().parent / "erd.png"
    img.save(output_path, "PNG")
    print(f"erd сохранён: {output_path}")


if __name__ == "__main__":
    main()
