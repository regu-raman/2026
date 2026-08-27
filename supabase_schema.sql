-- Supabase Database Schema Migration for Daily Expense Tracker (with Auth & RLS)

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    monthly_total NUMERIC(12, 2) NOT NULL DEFAULT 25000.00,
    categories JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create recurring_expenses table
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
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
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- 5. Create profiles table for username and user profile mapping
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for clean migration
DROP POLICY IF EXISTS "Allow public read/write on expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow public read/write on budgets" ON public.budgets;
DROP POLICY IF EXISTS "Allow public read/write on recurring_expenses" ON public.recurring_expenses;
DROP POLICY IF EXISTS "Allow public read/write on family_members" ON public.family_members;

DROP POLICY IF EXISTS "User expenses access" ON public.expenses;
DROP POLICY IF EXISTS "User budgets access" ON public.budgets;
DROP POLICY IF EXISTS "User recurring access" ON public.recurring_expenses;
DROP POLICY IF EXISTS "User family members access" ON public.family_members;
DROP POLICY IF EXISTS "Public profile lookup" ON public.profiles;
DROP POLICY IF EXISTS "User profile modification" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;

-- Create user-isolated RLS policies
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

-- Profile policies
CREATE POLICY "Public profile lookup" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "User profile modification" ON public.profiles
    FOR ALL USING (auth.uid() = id OR auth.uid() IS NULL)
    WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Trigger for auto-creating profiles record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        new.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
