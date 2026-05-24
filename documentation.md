# FinTrack - Expense Management System Documentation

This document describes the database schema, system architecture, and API endpoints implemented for the FinTrack backend.

## System Architecture

The application is structured into a subfolder design:
- `/frontend`: React + TypeScript + Vite + TailwindCSS.
- `/backend`: Node.js + TypeScript + Express + Prisma ORM + SQLite.

---

## Database Schema (Prisma / SQLite)

The database schema is defined as follows:

### 1. User
Represents a registered user on FinTrack.
- `id` (String, UUID, Primary Key)
- `email` (String, Unique)
- `fullName` (String)
- `phone` (String, Optional)
- `avatarUrl` (String, Optional)
- `password` (String, Hashed)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### 2. Account
A wallet or bank account belonging to a user.
- `id` (String, UUID, Primary Key)
- `name` (String)
- `type` (String: `BANK` | `EWALLET` | `CASH` | `CREDIT`)
- `balance` (Float)
- `currency` (String)
- `userId` (String, Foreign Key -> User, cascade delete)

### 3. Category
An income or expense category. Unique by user, name, and type.
- `id` (String, UUID, Primary Key)
- `name` (String)
- `type` (String: `EXPENSE` | `INCOME`)
- `icon` (String: e.g. `utensils`, `car`)
- `color` (String, Hex code)
- `userId` (String, Foreign Key -> User, cascade delete)

### 4. Transaction
An individual record of income or expense.
- `id` (String, UUID, Primary Key)
- `type` (String: `EXPENSE` | `INCOME`)
- `amount` (Float)
- `description` (String)
- `transactionDate` (DateTime)
- `userId` (String, Foreign Key -> User, cascade delete)
- `accountId` (String, Foreign Key -> Account, cascade delete)
- `categoryId` (String, Foreign Key -> Category, cascade delete)

### 5. Budget
A spending limit set on a specific category for a date range.
- `id` (String, UUID, Primary Key)
- `amountLimit` (Float)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `userId` (String, Foreign Key -> User, cascade delete)
- `categoryId` (String, Foreign Key -> Category, cascade delete)

---

## API Endpoints

All endpoints except authentication require the JWT token to be passed in the `Authorization: Bearer <token>` header.

### 1. Authentication
- `POST /api/auth/register` - Create a new account. Initializes default categories and a default cash account for the user.
- `POST /api/auth/login` - Authenticate email and password, returning JWT token and user profile.
- `GET /api/auth/me` - Fetch details of the currently authenticated user.

### 2. Accounts
- `GET /api/accounts` - Retrieve all accounts.
- `POST /api/accounts` - Create a new bank or wallet account.
- `PUT /api/accounts/:id` - Update account details.
- `DELETE /api/accounts/:id` - Delete an account (and cascade-delete all transactions).

### 3. Categories
- `GET /api/categories` - Retrieve user's custom categories.
- `POST /api/categories` - Add a custom category.
- `PUT /api/categories/:id` - Update category color or icon.
- `DELETE /api/categories/:id` - Delete a category.

### 4. Transactions
- `GET /api/transactions` - Paginated fetch with query parameter filters (`searchTerm`, `type`, `categoryId`, `accountId`, `startDate`, `endDate`).
- `POST /api/transactions` - Add a new transaction. Atomically updates the associated account's balance (adds for income, subtracts for expense).
- `PUT /api/transactions/:id` - Update transaction details. Atomically shifts and adjusts balances across old and new accounts.
- `DELETE /api/transactions/:id` - Delete a transaction. Reverts the balance adjustment on the account.

### 5. Budgets
- `GET /api/budgets` - Fetch budgets. Dynamically aggregates expense transactions within the budget's category and dates to compute `amountSpent` and `percentUsed`.
- `POST /api/budgets` - Create a new budget limit.
- `PUT /api/budgets/:id` - Update budget boundaries.
- `DELETE /api/budgets/:id` - Delete a budget.

### 6. Dashboard
- `GET /api/dashboard/summary` - Computes total net balance, monthly income/expense aggregates, 6-month historical trend comparison arrays, and current month's category expense percentages.
