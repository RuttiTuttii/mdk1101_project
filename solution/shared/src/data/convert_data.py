import pandas as pd
import json
import os

def convert_excel_to_json():
    import_path = "Задание/import/Tovar.xlsx"
    if not os.path.exists(import_path):
        print(f"File not found: {import_path}")
        return

    df = pd.read_excel(import_path)
    
    # Rename columns to match Product type
    # Article, Name, Unit, Price, MaxDiscount, Manufacturer, Category, CurrentDiscount, StockCount, Description, Image
    # 0: Артикул, 1: Наименование, 2: Ед. измерения, 3: Стоимость, 4: Размер максимальной скидки, 5: Производитель, 6: Категория товара, 7: Действующая скидка, 8: Кол-во на складе, 9: Описание, 10: Изображение
    
    mapping = {
        df.columns[0]: 'article',
        df.columns[1]: 'name',
        df.columns[2]: 'unit',
        df.columns[3]: 'price',
        df.columns[5]: 'manufacturer',
        df.columns[6]: 'category',
        df.columns[7]: 'discountPercent',
        df.columns[8]: 'stockCount',
        df.columns[9]: 'description',
        df.columns[10]: 'imagePath'
    }
    
    df = df.rename(columns=mapping)
    
    # Select only needed columns
    df = df[['article', 'name', 'unit', 'price', 'manufacturer', 'category', 'discountPercent', 'stockCount', 'description', 'imagePath']]
    
    # Fix image paths: replace 'Tovar_import\' with empty string or similar if needed
    # But usually it's just '1.jpg'
    df['imagePath'] = df['imagePath'].apply(lambda x: f"/{x}" if pd.notnull(x) else None)
    
    # Convert to list of dicts
    products = df.to_dict(orient='records')
    
    # Write to catalog-data.ts
    output_path = "solution/shared/src/data/catalog-data.ts"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('import { Product } from "../types";\n\n')
        f.write('export const CATALOG: Product[] = ')
        f.write(json.dumps(products, indent=2, ensure_ascii=False))
        f.write(';\n')

if __name__ == "__main__":
    convert_excel_to_json()
