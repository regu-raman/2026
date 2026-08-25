# Daily Expense Tracker

A modern, responsive web & mobile Daily Expense Tracking Application built with React, Vite, Tailwind CSS, Lucide Icons, Recharts, and Supabase.

## Features

- **Home Screen Dashboard**:
  - Today's, This Week's, and This Month's spending totals formatted in INR (`₹`).
  - Recent transactions activity list.
  - Quick "+ Add Expense" action.

- **Add & Edit Expense Form**:
  - Fields for Amount, Category (Food, Travel, Shopping, Bills, Medical, Education, Fuel, Other), Date, Payment Method (Cash, Credit Card, Debit Card, UPI, Bank Transfer), Note, Payer/Family Member, and Shared status toggle.

- **Reports & Analytics**:
  - Interactive Daily (7 Days), Weekly (4 Weeks), and Monthly (6 Months) spending trend bar charts.
  - Category-wise spending breakdown with visual progress bars and percentage distribution.

- **Transaction History**:
  - Search by note, category, payment method, or amount.
  - Filter by date range and category.
  - Edit and delete transaction records with modal confirmation.
  - One-click CSV and Excel (`.xlsx`) report export.

- **Family & Shared Expenses**:
  - Track individual contributions by family members (Self, Spouse, Parents, Kids, Family Shared).
  - Household split total calculations.

- **Budget Limits & Goals**:
  - Set monthly total and category-specific spending limits.
  - Progress bar indicators and alert notifications when exceeding budget limits.

- **Recurring Expenses**:
  - Automate subscriptions, rent, and utility bills (Daily, Weekly, Monthly, Yearly).
  - Automatic due bill processor.

- **Supabase Cloud Sync & LocalStorage**:
  - Seamless database sync with automatic LocalStorage offline backup.

---

## Supabase Database Setup

To create the required database tables and security policies in Supabase:

1. Open your Supabase project dashboard at [https://app.supabase.com](https://app.supabase.com).
2. Go to the **SQL Editor** tab from the left sidebar.
3. Copy the contents of [`supabase_schema.sql`](./supabase_schema.sql) in this repository.
4. Paste into the SQL Editor and click **Run**.
5. Copy your Supabase URL and Anon Key from **Project Settings > API**.
6. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Run unit and integration tests
npm test
```
