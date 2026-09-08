# SmartServe Forecasting Feature

## Overview

This document summarizes the forecasting feature added to SmartServe. The goal of the feature is to help staff predict:

- inventory items that may need restocking soon
- projected income based on recent sales trends

The implementation supports Holt's Linear Trend method, also known as double exponential smoothing, and an optional linear regression mode for easier explainability.

## Human Readable Note

This feature does not use fake or hardcoded forecast values. It reads the current database data and calculates predictions from that data.

In simple terms:

- it looks at past orders to estimate how fast products are being sold
- it checks current inventory counts to estimate when stock may run out
- it uses past sales totals to estimate the next income period
- it lets staff choose between two forecast styles: smoother Holt forecasting or simpler linear regression

It does not magically predict everything. It can only estimate future demand based on the patterns already stored in the system. If the order history is short or the sales pattern changes suddenly, the forecast will also be less accurate.

What was added in this update:

- a new Analytics page inside the existing admin Analytics area
- a restock forecast table sorted by urgency
- a projected income trend chart
- backend API endpoints for restock and income forecasting
- support for both Holt smoothing and linear regression
- better handling for sparse or bad data so the page does not crash

PS: kumukuha ng real-time na information abt dun sa mga orders and inventory, then mag p-predict ng  magiging needs sa future based dun sa mga pattern na nakita nung inimplement ko. Hindi nya kayang hulaan ang lahat, tinutukoy lang nya ang needs sa pag-restock at ang possible na takbo ng kita based dun sa previous sales and remaining stocks.

## Where It Lives

- Frontend page: `client/src/pages/admin/Analytics.jsx`
- Admin route: `/dashboard/analytics`
- Admin sidebar entry: `Analytics`
- Backend forecasting utility: `server/utils/forecastDemand.js`
- Backend API controller: `server/controllers/forecastController.js`
- Backend routes: `server/routes/forecastRoutes.js`

## Data Sources

The forecasting logic uses live MongoDB data from the existing application collections:

- Sales history comes from `Order`
- Order revenue comes from `Order.total`
- Order timestamps come from `Order.createdAt`
- Product-level demand is derived from `Order.items`
- Inventory stock comes from `InventoryItem.quantity`
- Reorder reference levels come from `InventoryItem.minThreshold`

This means the output is not hardcoded. It depends on the current order and inventory data in the database.

## Backend Behavior

Two admin-only API endpoints were added:

- `GET /api/forecast/restock`
- `GET /api/forecast/income`

Both endpoints accept a `method` query parameter:

- `holt` for Holt's Linear Trend smoothing
- `linear` for ordinary least-squares linear regression

Both routes are protected by the existing staff/admin JWT middleware, so student tokens cannot access them.

### Restock Forecast

The restock endpoint returns inventory items ranked by urgency. For each item, it calculates:

- forecasted daily demand
- forecasted demand over the selected lookahead window
- estimated days until stockout
- recommended reorder quantity

The recommended reorder amount includes a safety stock buffer so the system does not reorder too late when demand rises suddenly.

### Income Forecast

The income endpoint forecasts total sales for the next period and compares that forecast to the previous actual period.

Supported granularity options:

- daily
- weekly
- monthly

The page uses daily granularity by default, and the chart switches scale depending on the selected view.

## Frontend Behavior

The Analytics page shows:

- restock predictions in a table sorted by urgency
- a projected income trend chart with enhanced visual design
- summary cards for forecasted income, previous actual income, expected change, and urgent restock count
- dynamic method display showing which forecast algorithm is active (Holt vs Linear)
- interactive buttons to switch between Holt and Linear methods
- granularity selector (Daily, Weekly, Monthly) for different time scales

### Chart Improvements

The Projected Income Trend chart now includes:

- **Dynamic subtitle** that displays the active forecast method (e.g., "Historical actuals vs Holt's Linear Trend" or "Historical actuals vs Linear Regression")
- **Grid lines** for easier value reading
- **Enhanced data points** with white strokes and larger visibility
- **Gradient indicators** in the legend for better visual distinction
- **Smart date labels** that show only every nth date to prevent overlap and keep the chart readable
- **Shadow effects** on trend lines for depth
- **Improved spacing and padding** for a cleaner appearance
- **Legend with color-coded indicators** for Actual vs Forecast data

It also includes a message for low-data situations so staff can tell when the forecast is based on limited history.

## Forecast Method

The feature now supports two forecast methods.

### Holt's Linear Trend

- level captures the current baseline
- trend captures the direction and speed of change
- alpha controls how much recent data influences the level
- beta controls how much recent data influences the trend

Default smoothing values:

- alpha = 0.3
- beta = 0.1

These defaults are appropriate as a starting point for retail-style sales data, but they can be tuned later if needed.

### Linear Regression

Linear regression fits a straight line through the historical data and projects it forward.

- it is easier to describe to staff and non-technical users
- it can react more sharply to short-term spikes
- it is usually less stable than Holt for short retail series

The Analytics page now includes a selector so staff can compare both methods.

## Edge Cases Handled

The implementation handles these cases gracefully:

- insufficient sales history
- newly added products
- zero-sales periods
- items with no matching order history

When the data is too sparse, the UI shows a limited-history warning instead of pretending the forecast is precise.

## Notes and Limitations

- Forecast quality depends heavily on the amount and consistency of order history.
- If products are renamed in inventory but not in past orders, demand matching may be weaker.
- The current implementation matches items by normalized item name, so exact product naming still matters.

## Summary

The feature is fully integrated into the existing Analytics area and uses live backend data, not static demo values. It is ready for future refinement if more historical data becomes available or if a stronger product identifier becomes available across orders and inventory.

## Testing & Data Management

To test the forecasting feature, several utility scripts have been created:

### generateSampleOrders.js
Creates 30 realistic sample orders from actual students in the database, spread across the last 30 days.

**Usage:**
```bash
cd server
node generateSampleOrders.js
```

**What it does:**
- Removes all orders from the "Test Forecasting Student" 
- Fetches all real students from the database
- Generates 30 orders with realistic menu items and prices
- Spreads orders across 30 days with varied timestamps
- Displays a summary with total revenue and order breakdown

**Output example:**
```
✓ Found 7 students
✓ Created 30 sample orders
Total orders created: 30
Total revenue: ₱2,145.00
Orders by status:
  completed: 30
```

### seedForecastTestData.js
Creates 30 inventory items and 30 orders for testing the forecasting algorithms specifically.

**Usage:**
```bash
cd server
node seedForecastTestData.js
```

**What it does:**
- Creates 30 inventory items with varied stock levels (low, normal, high, critical)
- Generates 30 historical orders across 30 days
- Sets realistic minThreshold values for each item
- Labels items with names like "Rice", "Chicken", "Tomato", etc.

### cleanupForecastTestData.js
Removes data labeled with `[TEST_FORECAST]` prefix from the database.

**Usage:**
```bash
cd server
node cleanupForecastTestData.js
```

### Testing the APIs

Once you have sample data in the database, test the forecasting endpoints:

**Test Holt Forecast (Restock):**
```bash
curl -X GET "http://localhost:3001/api/forecast/restock?method=holt" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Test Linear Forecast (Restock):**
```bash
curl -X GET "http://localhost:3001/api/forecast/restock?method=linear" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Test Income Forecast:**
```bash
curl -X GET "http://localhost:3001/api/forecast/income?method=holt&granularity=day" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Testing in the UI

1. Log in as an admin user
2. Navigate to `/dashboard/analytics`
3. Use the buttons in the header to:
   - Switch between **Holt** and **Linear** methods
   - Select **Daily**, **Weekly**, or **Monthly** granularity
   - Click **Refresh** to reload the forecast data
4. Observe the chart subtitle change based on the selected method
5. Check that both the restock table and income chart update accordingly