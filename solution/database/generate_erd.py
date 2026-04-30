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


def center(box):
    x, y, w, h = box
    return x + w / 2, y + h / 2


def anchor_point(box, toward_x, toward_y):
    """выбираем точку привязки на границе таблицы."""
    x, y, w, h = box
    cx, cy = center(box)
    dx = toward_x - cx
    dy = toward_y - cy

    if abs(dx) >= abs(dy):
        if dx >= 0:
            return x + w, cy, "right"
        return x, cy, "left"

    if dy >= 0:
        return cx, y + h, "bottom"
    return cx, y, "top"


def route_points(src_box, dst_box):
    """строим ортогональный маршрут между таблицами."""
    sx, sy = center(src_box)
    dx, dy = center(dst_box)
    start_x, start_y, start_side = anchor_point(src_box, dx, dy)
    end_x, end_y, end_side = anchor_point(dst_box, sx, sy)

    points = [(start_x, start_y)]

    # если соединяем одинаковые стороны, делаем аккуратный внешний обход
    if start_side in {"left", "right"} and end_side in {"left", "right"}:
        mid_x = (start_x + end_x) / 2
        points.extend([(mid_x, start_y), (mid_x, end_y)])
    elif start_side in {"top", "bottom"} and end_side in {"top", "bottom"}:
        mid_y = (start_y + end_y) / 2
        points.extend([(start_x, mid_y), (end_x, mid_y)])
    else:
        # смешанный случай: сначала уходим от таблицы по нормали, потом выравниваемся
        if start_side in {"left", "right"}:
            offset = 28 if start_side == "right" else -28
            bend_x = start_x + offset
            points.extend([(bend_x, start_y), (bend_x, end_y)])
        else:
            offset = 28 if start_side == "bottom" else -28
            bend_y = start_y + offset
            points.extend([(start_x, bend_y), (end_x, bend_y)])

    points.append((end_x, end_y))
    return points


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


def draw_arrow(draw, points):
    """рисуем ломаную связь со стрелкой на конце."""
    if len(points) < 2:
        return

    draw.line(points, fill=LINE_COLOR, width=2)

    # стрелка по последнему сегменту, чтобы наконечник был всегда в конце связи
    import math

    (x1, y1), (x2, y2) = points[-2], points[-1]
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_len = 12
    arrow_angle = 0.45
    ax = x2 - arrow_len * math.cos(angle - arrow_angle)
    ay = y2 - arrow_len * math.sin(angle - arrow_angle)
    bx = x2 - arrow_len * math.cos(angle + arrow_angle)
    by = y2 - arrow_len * math.sin(angle + arrow_angle)
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
        src_box = table_boxes[src]
        dst_box = table_boxes[dst]
        points = route_points(src_box, dst_box)
        draw_arrow(draw, points)

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
