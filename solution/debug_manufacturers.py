import sqlite3
import json

conn = sqlite3.connect('backend/shoe_store.db')
cursor = conn.cursor()
cursor.execute("SELECT DISTINCT manufacturer FROM products")
manufacturers = [row[0] for row in cursor.fetchall()]
conn.close()

with open('manufacturers_debug.json', 'w', encoding='utf-8') as f:
    json.dump(manufacturers, f, ensure_ascii=False, indent=2)
