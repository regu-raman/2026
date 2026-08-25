-- Supabase Database Schema Migration for Daily Expense Tracker

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL,
    note TEXT,
    member TEXT DEFAULT 'Self',
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id TEXT PRIMARY KEY DEFAULT 'default',
    monthly_total NUMERIC(12, 2) NOT NULL DEFAULT 25000.00,
    categories JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create recurring_expenses table
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id TEXT PRIMARY KEY,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    note TEXT,
    frequency TEXT NOT NULL DEFAULT 'Monthly',
    next_due_date DATE NOT NULL,
    member TEXT DEFAULT 'Self',
    is_shared BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) and grant open access for public client usage
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Create open policy for anon/authenticated access
CREATE POLICY "Allow public read/write on expenses" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on recurring_expenses" ON public.recurring_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on family_members" ON public.family_members FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Family Members
INSERT INTO public.family_members (name) VALUES
    ('Self'),
    ('Spouse'),
    ('Parents'),
    ('Kids'),
    ('Family Shared')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Budget Record
INSERT INTO public.budgets (id, monthly_total, categories) VALUES
    ('default', 25000.00, '{"Food": 8000, "Fuel": 4000, "Bills": 5000, "Medical": 4000, "Shopping": 6000, "Education": 5000, "Travel": 3000, "Other": 2000}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Expenses Data
INSERT INTO public.expenses (id, amount, category, date, payment_method, note, member, is_shared) VALUES
    ('sample-1', 450.00, 'Food', CURRENT_DATE, 'UPI', 'Dinner with family', 'Self', FALSE),
    ('sample-2', 1200.00, 'Fuel', CURRENT_DATE, 'Credit Card', 'Car full tank fuel', 'Spouse', TRUE),
    ('sample-3', 3500.00, 'Shopping', CURRENT_DATE - INTERVAL '2 days', 'Credit Card', 'Grocery & Home supplies', 'Family Shared', TRUE),
    ('sample-4', 2400.00, 'Bills', CURRENT_DATE - INTERVAL '4 days', 'Bank Transfer', 'Electricity bill', 'Self', TRUE),
    ('sample-5', 450.00, 'Travel', CURRENT_DATE - INTERVAL '5 days', 'Cash', 'Metro train pass', 'Kids', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Recurring Expenses Data
INSERT INTO public.recurring_expenses (id, amount, category, payment_method, note, frequency, next_due_date, member, is_shared, active) VALUES
    ('rec-1', 12000.00, 'Bills', 'Bank Transfer', 'House Rent', 'Monthly', CURRENT_DATE, 'Family Shared', TRUE, TRUE),
    ('rec-2', 699.00, 'Bills', 'Credit Card', 'Broadband Wi-Fi Plan', 'Monthly', CURRENT_DATE, 'Self', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;
