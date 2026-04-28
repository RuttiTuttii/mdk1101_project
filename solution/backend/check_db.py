import sqlite3
import os

db_path = r'C:\Users\eegor\.4projects\mdk1101_project\solution\backend\shoe_store.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute("SELECT article, name FROM products WHERE article LIKE '%112%'")
row = cur.fetchone()
if row:
    article, name = row
    print(f"Article: {article}")
    print(f"Article hex: {article.encode('utf-8').hex()}")
    print(f"Name: {name}")
    print(f"Name hex: {name.encode('utf-8').hex()}")
else:
    print("Product not found")
conn.close()
