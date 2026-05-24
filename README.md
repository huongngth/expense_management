# FinTrack - Personal Expense Management System

FinTrack is a premium personal expense management platform that enables users to gain total control over their finances, organize category expenditures, oversee wallets and bank assets and set monthly budgets.

---

## Architecture Overview

The system is structured as a decoupled monorepo:

*   **`frontend/`**: Built with **React**, **TypeScript**, **Vite**, and **TailwindCSS**. Visual analytics are rendered dynamically using **Recharts** and styled with a sleek, Harmonious Dark/Navy palette.
*   **`backend/`**: Built with **Node.js (Express)**, **TypeScript**, and **Prisma ORM** connecting to a local **SQLite** database.

---

## Product Features

1.  **Dynamic Dashboard Analytics**: Visualizes income vs. expense trends over the last 6 months and renders donut-chart distributions of expense categories.
2.  **Asset & Liability Tracking**: Manages wallets, credit cards, bank accounts, and cash balances with real-time assets vs. liabilities net worth calculation.
3.  **Atomic Balance Adjustments**: Enforces transaction safety; adding, editing, or deleting transactions automatically updates the corresponding account balance.
4.  **Category Budget Caps**: Sets limits for specific categories with real-time aggregated spending feedback (On Track, Warning, and Exceeded statuses).
5.  **Autonomous Seeding**: Automatically seeds basic categories and a cash wallet upon user registration.

---

## Onboarding Guide: Getting Started

Follow these steps to spin up the local development environment.

### Prerequisites
Make sure you have **Node.js** (v18+ recommended) installed on your system.

### 1. Setup the Backend Database & Server
Navigate to the `backend` folder to configure the DB and boot the API server:

```bash
# Move to the backend folder
cd backend

# Install dependencies
npm install

# Run database migrations and generate the Prisma client
npx prisma migrate dev --name init

# Boot the API server in hot-reload development mode
npm run dev
```

*   The database is initialized at `backend/prisma/dev.db`.
*   The backend server runs locally on **`http://localhost:5001`**.
*   It automatically runs the seed script during migrations to populate data.

### 2. Setup the Frontend Client
Open a new terminal window/tab and navigate to the `frontend` folder to boot the client:

```bash
# Move to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

*   The frontend client will run on **`http://localhost:5173`**.
*   Open the link in your web browser to access the application.

---

## Demo Credentials

The database comes pre-seeded with a default user and historical transactions:
*   **Email**: `a@example.com`
*   **Password**: `password123`

* Nguyen Thi Huong:
* Phone No: 0978645231
*   **Password**: `password123`
