# Plan for the Shoe Store Solution

## 1. Data model
- Normalize the imported spreadsheets into `roles`, `users`, `categories`, `manufacturers`, `suppliers`, `products`, `product_images`, `orders`, and `order_items`.
- Keep `products.discount_percent`, `products.stock_count`, and `products.image_path` as first-class fields so the catalog UI can render discount and availability states directly.
- Treat the order import as a source for order headers plus order lines; the `Артикулы заказа и количество` column becomes `order_items`.

## 2. Shared backend core
- Build a reusable Python package with ORM models, Pydantic schemas, repository helpers, and business services.
- Move catalog pricing logic, order total calculation, discount application, and authorization rules into services so both web and desktop reuse the same behavior.
- Add import/seed utilities for the provided Excel data.

## 3. API
- Implement JWT login by username/password.
- Add product endpoints for list, detail by article, create, update, and delete.
- Add order endpoints for current user orders and admin/manager order updates.
- Add a catalog query endpoint with combined search, manufacturer filter, max price filter, discount-only toggle, in-stock toggle, and sort options.

## 4. Web application
- Create a product catalog UI in React Vite using Radix UI and shadcn components.
- Render product cards in the format required by the assignment: image, category/name, description, manufacturer, supplier, price, unit, stock, and active discount.
- Show original price struck through and discounted price beside it.
- Add login, orders view, and order creation flow.

## 5. Desktop application
- Wrap the same UI in Tauri for the desktop version.
- Add login-first flow, catalog view, color rules for discount and stock state, and CRUD controls for manager/admin users.
- Save product images to the app folder and store paths in the database.

## 6. Delivery
- Keep source code under version control, not as archives.
- Store DB schema and seed scripts, plus ERD and exported import data, alongside the solution.

