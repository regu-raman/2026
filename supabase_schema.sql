-- Supabase Database Schema Migration for Daily Expense Tracker (with Auth & RLS)

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
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
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    monthly_total NUMERIC(12, 2) NOT NULL DEFAULT 25000.00,
    categories JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create recurring_expenses table
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
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
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing public policies if re-running
DROP POLICY IF EXISTS "Allow public read/write on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public read/write on budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow public read/write on recurring_expenses" ON public.recurring_expenses;
DROP POLICY IF EXISTS "Allow public read/write on family_members" ON public.family_members;

DROP POLICY IF EXISTS "User expenses access" ON public.expenses;
DROP POLICY IF EXISTS "User budgets access" ON public.budgets;
DROP POLICY IF EXISTS "User recurring access" ON public.recurring_expenses;
DROP POLICY IF EXISTS "User family members access" ON public.family_members;

-- Create user-isolated RLS policies (for authenticated users) or public access if user_id is null/guest
CREATE POLICY "User expenses access" ON public.expenses
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "User budgets access" ON public.budgets
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "User recurring access" ON public.recurring_expenses
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "User family members access" ON public.family_members
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Insert Default Family Members
INSERT INTO public.family_members (name) VALUES
    ('Self'),
    ('Spouse'),
    ('Parents'),
    ('Kids'),
    ('Family Shared')
ON CONFLICT DO NOTHING;

-- Insert Default Budget Record
INSERT INTO public.budgets (id, monthly_total, categories) VALUES
    ('default', 25000.00, '{"Food": 8000, "Fuel": 4000, "Bills": 5000, "Medical": 4000, "Shopping": 6000, "Education": 5000, "Travel": 3000, "Other": 2000}'::jsonb)
ON CONFLICT (id) DO NOTHING;
