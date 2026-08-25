# SmartServe  — Analytics & Forecast Guide

This page helps you understand what the Analytics section is showing you and how the canteen predictions work. No technical background needed.

---

## What is this page for?

The Analytics page does two things:

1. **Predicts your future income** — based on how much was sold in the past.
2. **Tells you which items to restock** — before you run out.

It reads real order and inventory data from the system. It does **not** use made-up or fixed numbers.

---

## The Chart — How to Read It

When you open the Analytics page, you'll see a **Projected Income Trend** chart. Here's what each part means:

| What you see | What it means |
|---|---|
| **Green line** | Actual past sales (what really happened) |
| **Amber / yellow dashed line** | The system's prediction for future sales |
| **Yellow shaded zone** | The forecast region — everything to the right of the divider |
| **"FORECAST" badge on the chart** | Labels where predictions start |
| **Dashed vertical line** | The exact point where history ends and prediction begins |
| **Amber callout bubbles** (e.g. `₱12.5K`) | The predicted income value for each future period |
| **Amber pill badges** below the header | A quick summary of each forecasted period and its amount |
| **Bold amber date labels** | Date labels inside the forecast zone, so you know which dates are predicted |

> **In short:** everything on the left of the vertical line is real. Everything on the right is the system's best guess.

---

## The Two Forecast Methods

You can switch between two ways the system calculates predictions using the **Holt** and **Linear** buttons at the top.

### Holt (Recommended)

- Looks at both recent sales **and** the direction sales are trending (going up or down).
- Smooths out one-off busy days so predictions stay stable.
- Best choice for most situations.

### Linear

- Draws a straight line based on past sales and extends it forward.
- Easier to explain, but it can react more strongly to a single unusual day.
- Good for a quick sanity check.

---

## The Time Scale (Daily / Weekly / Monthly)

Use the **Daily**, **Weekly**, and **Monthly** buttons to change how data is grouped.

- **Daily** — Best for fast-moving items like snacks and meals. Shows day-by-day predictions.
- **Weekly** — Good for a week-ahead view of income and stock.
- **Monthly** — Best for long-term planning of non-perishable ingredients.

---

## The Summary Cards

At the top of the page, four cards give you a quick snapshot:

| Card | What it shows |
|---|---|
| **Projected Income** | What the system predicts you'll earn in the next period |
| **Previous Period** | What you actually earned in the prior period |
| **Expected Change** | Whether next period is trending up (🟢 +%) or down (🔴 -%) |
| **Urgent Restocks** | How many items are at risk of running out within 7 days |

---

## The Restock Table

Below the chart is a table of inventory items, sorted by urgency. Here's what each column means:

| Column | What it means |
|---|---|
| **Item** | Product name, category, and a warning if data is limited |
| **Current Stock** | How much is left, and the minimum threshold set for that item |
| **Forecast Daily Demand** | Estimated units sold per day based on past orders |
| **Urgency / Stockout** | A badge showing how urgent the situation is |
| **Recommended Reorder** | How much to buy to cover upcoming demand plus a safety buffer |

### Urgency Badge Colors

| Badge | Meaning |
|---|---|
| 🔴 **Out of Stock** | Zero inventory remaining |
| 🔴 **Critical** | Will run out in **3 days or less** |
| 🟡 **Low Stock** | Stock has fallen below the item's set minimum threshold |
| 🟡 **Warning** | Will run out in **7 days or less** |
| 🟢 **Stable** | Stock is healthy, no action needed yet |

You can also **search** by name or category, **filter** by category, and **export the table as a CSV** file using the buttons at the top of the table.

---

## How the System Calculates All of This

The system reads live data from the database every time the page loads. Here's the simple version of what it does:

1. **Looks at past completed orders** to figure out how fast things are selling.
2. **Checks current inventory counts** to estimate when stock will run out.
3. **Adds a safety buffer** (a few extra days of stock) so you don't cut it too close.
4. **Applies either Holt or Linear math** to project income and demand into the future.

It only knows what it can see. If you just added a new item with no order history, predictions for that item will be limited. The system will show a **"Limited history"** tag in those cases.

---

## Things to Keep in Mind

- The predictions are based on **patterns from past orders**, not guarantees.
- A sudden change in sales (a school event, a holiday) can affect accuracy.
- The more order history the system has, the more reliable the forecast becomes.
- Use the **Refresh** button to reload the latest data at any time.
- Use the **Guide** button (the ❓ icon at the top) for a quick in-app reference.
