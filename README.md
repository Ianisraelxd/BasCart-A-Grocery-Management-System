# BasCart-A Grocery Management System

A web-based management system for **BasCart-A Grocery Store**, built for ITP103 (System Integration and Architecture) Finals Lab Activity 2 at the University of Cabuyao, College of Computing Studies.

The system puts the enterprise data architecture from the activity into working software. Purchasing, inventory, store sales, online orders, payments, and reporting all share one set of records, so a completed sale updates inventory and finance automatically.

## Features

| Module | What it does |
| --- | --- |
| **Dashboard** | Today's sales, transactions, low-stock count, open purchase orders and online orders, inventory value, and a daily sales goal bar. |
| **Point of Sale** | Search and tap products, pick a customer, pay by cash, GCash or card, and get a receipt. Stock is checked before the sale and updated after it. |
| **Online Orders** | Place orders for delivery. Stock is reserved when an order is placed, then moves through Pending, Preparing, Out for Delivery and Delivered. Cancelling returns the stock. |
| **Products** | Product master data: code, name, category, unit, cost, price, reorder level, and status. |
| **Inventory** | Stock levels with OK, Low and Out status, manual adjustments with a required reason, and a full movement log. |
| **Suppliers** | Supplier profiles, contact details, payment terms, and products supplied. |
| **Purchasing** | Purchase orders with the flow Draft, Sent, Received. New orders are pre-filled with items at or below their reorder level. Receiving stock updates inventory and records an expense. |
| **Customers** | Customer profiles with total purchases. |
| **Sales** | Store and online sales history with line items. |
| **Finance** | Revenue and expense ledger, payment records, and a pending payments total. |
| **Reports** | Sales by day, top products, sales by payment method, inventory valuation, low stock, and purchasing summary, with CSV export. |
| **Employees** | Employee records, roles, schedules, status, and PINs. |
| **Audit Log** | A searchable trace of important changes and who made them. |
| **Backup** | Download a JSON backup, restore from one, or reset to the sample data. |

The app works on desktop and on phones. It uses a translucent glass interface with automatic light and dark modes, smooth animations, and soft synthesized sound effects. Use the speaker button to mute the sounds.

## How it maps to the activity

### Data process flows

1. **Purchasing and supplier management:** review stock levels, create a purchase order, send it to the supplier, receive the products, record the purchase.
2. **Inventory management:** receive stock, update inventory, monitor reorder levels, adjust stock, report.
3. **Store sales / POS:** select products, check inventory, calculate the total, process payment, record the sale and update stock.
4. **Online order and delivery:** place the order, validate items and customer, reserve stock, prepare and dispatch, update the order status.

### Data governance rules

| Rule | How the system applies it |
| --- | --- |
| Access control | Each role only sees the modules it needs (see below). |
| Data accuracy | Required fields, unique product codes, positive prices, whole-number quantities, stock limits, and payment checks are validated before anything is saved. |
| Data privacy | Only the customer and employee details needed for operations are collected. |
| Data security | Sign-in requires an active account and PIN. Sessions end when the browser tab closes. |
| Backup and recovery | Backup page with JSON download and restore. |
| Data retention | Products, sales, and orders are never deleted. Products are set to Inactive instead. |
| Change and audit logging | Creates, updates, stock adjustments, sales, orders, purchase orders, sign-ins and restores are logged with the user and time. |
| Data quality and ownership | Each data area has a responsible role, shown in the access table below. |

### Roles and access

| Role | Modules |
| --- | --- |
| Store Manager | All modules |
| Inventory Manager | Dashboard, Products, Inventory, Reports |
| Purchasing Manager | Dashboard, Suppliers, Purchasing, Inventory, Reports |
| Sales Manager | Dashboard, Point of Sale, Sales, Customers, Reports |
| Cashier | Dashboard, Point of Sale |
| Customer Service | Dashboard, Customers, Online Orders |
| Finance Manager | Dashboard, Sales, Finance, Reports |
| HR/Admin | Dashboard, Employees, Audit Log |

## Tech stack

- [React](https://react.dev/) 19
- [Vite](https://vite.dev/) 8
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting
- Plain CSS, with no UI framework
- Browser `localStorage` for data (no backend)

## Getting started

You need [Node.js](https://nodejs.org/) 20 or newer.

```bash
git clone <your-repository-url>
cd basCart-A
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

To use it on a phone, make sure the phone and computer are on the same Wi-Fi, then run `npm run dev -- --host` and open the Network address Vite prints.

### Other scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |

## Signing in

The app starts with sample data: 25 grocery products, 4 suppliers, 3 customers, and one employee for each role. Pick an employee on the sign-in screen and enter the PIN. **Every sample account uses PIN `1234`.** Use the Employees page to change PINs.

Sign in as **Maria Santos (Store Manager)** to see every module.

## Project structure

```
src/
  main.jsx          App entry point
  App.jsx           Sign-in screen, layout, navigation
  App.css           Styles (layout, components, phone layout)
  index.css         Design tokens and global styles
  store.jsx         Data store, sample data, business rules, role access
  ui.jsx            Shared components (tables, modals, toasts, and more)
  sfx.js            Small sound effects, with a mute option
  pages/            One file per module
```

All business rules (stock changes, order status flow, payments, finance records, audit entries) live in `src/store.jsx`, so every screen follows the same rules.

## Data storage and limitations

- Data is saved in the browser's `localStorage`. It is not shared between browsers or computers, and clearing site data erases it. Use **Backup** to download regular copies.
- PINs are stored in plain text in the browser. This is fine for a classroom demo and is not suitable for production.
- There is no server, so roles control what each screen shows but are not a real security boundary.
- Online orders are entered by staff. There is no customer-facing storefront.

Moving to a real deployment would mean adding a backend API and database, hashed credentials, and server-side permission checks.

## Team

**Group BasCart-A, 3ITC** (1st semester, 2026-2027)

- Algara, Andrie
- Atchico, John Michael A.
- Bingco, Mariel Danica D.
- Manalo, Ian Israel C.
- Oca, Kenneth Ryan C.
- Segundo, Jewel P.
- Vicente, Vianca May D.
- Villarosa, Cristina T.
- Zamudio, Kenneth D.

## Course

ITP103, System Integration and Architecture
Finals Lab Activity 2: Enterprise Data and Information Architecture (based on the Zachman Framework)
University of Cabuyao (Pamantasan ng Cabuyao), College of Computing Studies
