-- ==============================================================================
-- Migration: 20261121010000_owner_and_payments.sql
-- CreatorFlow AI: Owner/Admin Role & INR Payment Infrastructure
-- ==============================================================================

-- 1. Add role & is_owner columns to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT false;

-- 2. Protect role and plan_tier against client self-escalation via RLS
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger AS $$
BEGIN
    -- Only service_role (or superuser) can modify role, is_owner, or plan_tier directly
    IF current_user <> 'service_role' AND current_user <> 'postgres' THEN
        new.role := old.role;
        new.is_owner := old.is_owner;
        new.plan_tier := old.plan_tier;
    END IF;
    new.updated_at := timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- 3. Payment Orders Table (INR Gateway Orders)
CREATE TABLE IF NOT EXISTS public.payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL UNIQUE,
    plan_tier plan_tier NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount_inr NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'refunded')),
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    gateway_payment_id TEXT,
    gateway_signature TEXT,
    error_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Invoices Table (Official INR Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    amount_inr NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'refunded', 'void')),
    plan_name TEXT NOT NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_order_id ON public.payment_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON public.admin_audit_logs(admin_id);

-- 7. Enable RLS
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Policies
-- Payment orders: user can view their own orders
CREATE POLICY "Users can view own payment orders" ON public.payment_orders
    FOR SELECT USING (auth.uid() = user_id);

-- Invoices: user can view their own invoices
CREATE POLICY "Users can view own invoices" ON public.invoices
    FOR SELECT USING (auth.uid() = user_id);

-- Admin Audit Logs: only admin/owner can view
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = auth.uid()
            AND public.profiles.role IN ('admin', 'owner')
        )
    );

-- 9. Automatically assign Owner role for the developer/owner account
UPDATE public.profiles
SET role = 'owner', is_owner = true, plan_tier = 'pro'
WHERE email = 'jaspreetsing3412@gmail.com';

-- 10. Update handle_new_user() trigger to automatically grant owner role to owner email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role TEXT := 'user';
    is_owner_val BOOLEAN := false;
    user_plan plan_tier := 'free';
BEGIN
    IF new.email = 'jaspreetsing3412@gmail.com' THEN
        user_role := 'owner';
        is_owner_val := true;
        user_plan := 'pro';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, avatar_url, plan_tier, role, is_owner)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        user_plan,
        user_role,
        is_owner_val
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = CASE WHEN new.email = 'jaspreetsing3412@gmail.com' THEN 'owner' ELSE public.profiles.role END,
        is_owner = CASE WHEN new.email = 'jaspreetsing3412@gmail.com' THEN true ELSE public.profiles.is_owner END,
        plan_tier = CASE WHEN new.email = 'jaspreetsing3412@gmail.com' THEN 'pro'::plan_tier ELSE public.profiles.plan_tier END;

    INSERT INTO public.subscriptions (user_id, plan_tier, status)
    VALUES (new.id, user_plan, 'active')
    ON CONFLICT (user_id) DO NOTHING;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant schema privileges
GRANT ALL ON TABLE public.payment_orders TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.invoices TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_audit_logs TO anon, authenticated, service_role;
