-- ====================================================================
-- VELVET CREATOR PLATFORM: FULL SUPABASE POSTGRESQL SCHEMA
-- Includes table schemas, enumerations, table relationships (foreign keys),
-- and comprehensive Row Level Security (RLS) policies.
-- ====================================================================

-- 1. Create custom types / enums
CREATE TYPE user_role AS ENUM ('creator', 'fan');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE transaction_type AS ENUM ('subscription', 'ppv');

-- 2. Profiles Table
-- Maps directly to Supabase Auth users via trigger
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    email VARCHAR(255) UNIQUE,
    role user_role NOT NULL DEFAULT 'fan',
    avatar_url TEXT,
    bio TEXT,
    is_creator BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Posts Table
-- Creator's posts, containing descriptions, media URLs, and locked settings
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_urls TEXT[] DEFAULT '{}',
    is_locked BOOLEAN NOT NULL DEFAULT true,
    price NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subscriptions Table
-- Links active recurring subscriptions purchased by fans of the creator
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    razorpay_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Transactions Table
-- Logging for Razorpay payment triggers (subscriptions or single-ticket PPVs)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    order_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status transaction_status NOT NULL DEFAULT 'pending',
    type transaction_type NOT NULL,
    target_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL, -- for PPV type transactions
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable Database Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY RULES (RLS POLICIES)
-- ==========================================

-- A. Profiles RLS Policies
-- Users can read all creator profiles, but can only update their own profile
CREATE POLICY "Public profiles can be viewed by anyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can fully update their own profiles" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- B. Posts RLS Policies
-- Creators can fully manage their own posts (Insert, Update, Delete)
CREATE POLICY "Creators can manage their own posts"
ON public.posts FOR ALL
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- Fans can view a post only if:
-- 1. The post is public (is_locked = false), OR
-- 2. The fan is the creator of the post, OR
-- 3. The fan has an active subscription to the creator, OR
-- 4. The fan has purchased this specific PPV post.
CREATE POLICY "Accessible posts can be viewed by fans"
ON public.posts FOR SELECT
USING (
    is_locked = false -- Public post
    OR auth.uid() = creator_id -- Owner of the post
    -- Active subscription check
    OR EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.fan_id = auth.uid() 
          AND s.creator_id = posts.creator_id 
          AND s.status = 'active'
          AND s.expiry_date > NOW()
    )
    -- PPV purchase check
    OR EXISTS (
        SELECT 1 FROM public.transactions t
        WHERE t.user_id = auth.uid()
          AND t.target_post_id = posts.id
          AND t.status = 'success'
          AND t.type = 'ppv'
    )
);

-- C. Subscriptions RLS Policies
-- Fans can view their own subscriptions
CREATE POLICY "Fans can view their own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = fan_id);

-- Creators can view subscriptions to their profile
CREATE POLICY "Creators can view their followers' subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = creator_id);

-- D. Transactions RLS Policies
-- Users can view their own transaction history
CREATE POLICY "Users can inspect their own transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id);


-- ==========================================
-- AUTOMATION TRIGGER FOR PROFILE SYNCHRONIZATION
-- Automatically runs whenever a new user registers through Supabase Auth
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role, is_creator)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'creative_fan_' || substr(new.id::text, 1, 6)),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'fan'),
    COALESCE((new.raw_user_meta_data->>'is_creator')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
