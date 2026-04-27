import pandas as pd
import json
import os

def convert_users_to_json():
    import_path = "Задание/import/user_import.xlsx"
    if not os.path.exists(import_path):
        print(f"File not found: {import_path}")
        return

    df = pd.read_excel(import_path)
    
    # Columns: Роль, ФИО, Логин, Пароль
    mapping = {
        df.columns[0]: 'role',
        df.columns[1]: 'fullName',
        df.columns[2]: 'login',
        df.columns[3]: 'password'
    }
    
    df = df.rename(columns=mapping)
    
    # Select and cleanup
    df = df[['role', 'fullName', 'login', 'password']]
    
    # Convert roles to internal names if needed
    # (assuming backend uses admin/manager/client)
    
    users = df.to_dict(orient='records')
    
    # Write to a helper file for reference or use in mock
    output_path = "solution/shared/src/data/users-data.ts"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('export const IMPORTED_USERS = ')
        f.write(json.dumps(users, indent=2, ensure_ascii=False))
        f.write(';\n')

if __name__ == "__main__":
    convert_users_to_json()
