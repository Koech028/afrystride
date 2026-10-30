@echo off
setlocal

echo ============================================
echo  AfryStride Sportswear - Project Scaffolding
echo ============================================
echo.
echo This will create two folders in the current directory:
echo   - afrystride-backend
echo   - afrystride-frontend
echo.
pause

REM ================================================================
REM  BACKEND  -  afrystride-backend/
REM ================================================================
echo.
echo Creating backend structure...

mkdir afrystride-backend\app\core
mkdir afrystride-backend\app\api\v1
mkdir afrystride-backend\app\models\mongo
mkdir afrystride-backend\app\models\sql
mkdir afrystride-backend\app\schemas
mkdir afrystride-backend\app\services
mkdir afrystride-backend\app\utils
mkdir afrystride-backend\tests

REM -- app/
type nul > afrystride-backend\app\main.py

REM -- app/core/
type nul > afrystride-backend\app\core\config.py
type nul > afrystride-backend\app\core\security.py
type nul > afrystride-backend\app\core\database.py

REM -- app/api/v1/
type nul > afrystride-backend\app\api\v1\router.py
type nul > afrystride-backend\app\api\v1\products.py
type nul > afrystride-backend\app\api\v1\categories.py
type nul > afrystride-backend\app\api\v1\admin.py
type nul > afrystride-backend\app\api\v1\contact.py
type nul > afrystride-backend\app\api\v1\orders.py
type nul > afrystride-backend\app\api\v1\payments.py

REM -- app/models/mongo/
type nul > afrystride-backend\app\models\mongo\product.py
type nul > afrystride-backend\app\models\mongo\category.py

REM -- app/models/sql/
type nul > afrystride-backend\app\models\sql\order.py
type nul > afrystride-backend\app\models\sql\customer.py
type nul > afrystride-backend\app\models\sql\payment.py

REM -- app/schemas/
type nul > afrystride-backend\app\schemas\product_schema.py
type nul > afrystride-backend\app\schemas\order_schema.py
type nul > afrystride-backend\app\schemas\admin_schema.py

REM -- app/services/
type nul > afrystride-backend\app\services\product_service.py
type nul > afrystride-backend\app\services\order_service.py
type nul > afrystride-backend\app\services\mpesa_service.py
type nul > afrystride-backend\app\services\stripe_service.py

REM -- app/utils/
type nul > afrystride-backend\app\utils\image_upload.py
type nul > afrystride-backend\app\utils\validators.py

REM -- tests/
type nul > afrystride-backend\tests\test_products.py
type nul > afrystride-backend\tests\test_orders.py

REM -- root files
type nul > afrystride-backend\.env
type nul > afrystride-backend\.env.example
type nul > afrystride-backend\requirements.txt
type nul > afrystride-backend\render.yaml

echo Backend structure created.

REM ================================================================
REM  FRONTEND  -  afrystride-frontend/
REM ================================================================
echo.
echo Creating frontend structure...

mkdir afrystride-frontend\public
mkdir afrystride-frontend\src\assets\images
mkdir afrystride-frontend\src\assets\icons
mkdir afrystride-frontend\src\components\layout
mkdir afrystride-frontend\src\components\product
mkdir afrystride-frontend\src\components\ui
mkdir afrystride-frontend\src\components\cart
mkdir afrystride-frontend\src\pages\admin
mkdir afrystride-frontend\src\hooks
mkdir afrystride-frontend\src\services
mkdir afrystride-frontend\src\context
mkdir afrystride-frontend\src\styles
mkdir afrystride-frontend\src\utils

REM -- public/
type nul > afrystride-frontend\public\logo.svg
type nul > afrystride-frontend\public\favicon.ico

REM -- src/
type nul > afrystride-frontend\src\main.jsx
type nul > afrystride-frontend\src\App.jsx

REM -- src/assets/ (placeholders so empty folders aren't lost in git)
type nul > afrystride-frontend\src\assets\images\.gitkeep
type nul > afrystride-frontend\src\assets\icons\.gitkeep

REM -- src/components/layout/
type nul > afrystride-frontend\src\components\layout\Header.jsx
type nul > afrystride-frontend\src\components\layout\Footer.jsx
type nul > afrystride-frontend\src\components\layout\StickyOrderBar.jsx

REM -- src/components/product/
type nul > afrystride-frontend\src\components\product\ProductCard.jsx
type nul > afrystride-frontend\src\components\product\ProductGrid.jsx
type nul > afrystride-frontend\src\components\product\ProductGallery.jsx

REM -- src/components/ui/
type nul > afrystride-frontend\src\components\ui\Button.jsx
type nul > afrystride-frontend\src\components\ui\Badge.jsx
type nul > afrystride-frontend\src\components\ui\FilterPanel.jsx

REM -- src/components/cart/  (Phase 2)
type nul > afrystride-frontend\src\components\cart\CartDrawer.jsx
type nul > afrystride-frontend\src\components\cart\CheckoutForm.jsx

REM -- src/pages/
type nul > afrystride-frontend\src\pages\Home.jsx
type nul > afrystride-frontend\src\pages\Shop.jsx
type nul > afrystride-frontend\src\pages\ProductDetail.jsx
type nul > afrystride-frontend\src\pages\About.jsx
type nul > afrystride-frontend\src\pages\Contact.jsx

REM -- src/pages/admin/
type nul > afrystride-frontend\src\pages\admin\AdminLogin.jsx
type nul > afrystride-frontend\src\pages\admin\AdminDashboard.jsx
type nul > afrystride-frontend\src\pages\admin\AdminProducts.jsx

REM -- src/hooks/
type nul > afrystride-frontend\src\hooks\useProducts.js
type nul > afrystride-frontend\src\hooks\useCart.js

REM -- src/services/
type nul > afrystride-frontend\src\services\api.js
type nul > afrystride-frontend\src\services\productService.js
type nul > afrystride-frontend\src\services\orderService.js

REM -- src/context/
type nul > afrystride-frontend\src\context\AuthContext.jsx
type nul > afrystride-frontend\src\context\CartContext.jsx

REM -- src/styles/
type nul > afrystride-frontend\src\styles\tailwind.css

REM -- src/utils/
type nul > afrystride-frontend\src\utils\formatCurrency.js

REM -- root files
type nul > afrystride-frontend\.env
type nul > afrystride-frontend\.env.example
type nul > afrystride-frontend\tailwind.config.js
type nul > afrystride-frontend\vite.config.js
type nul > afrystride-frontend\package.json

echo Frontend structure created.

echo.
echo ============================================
echo  Done. Both folders are ready in:
echo  %cd%
echo ============================================
echo.
pause