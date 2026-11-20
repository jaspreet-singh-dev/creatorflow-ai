-- ==============================================================================
-- CREATORFLOW AI: Comprehensive Supabase PostgreSQL Schema
-- Migration: 20261120000000_init_schema.sql
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM ('free', 'creator', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE video_privacy AS ENUM ('private', 'unlisted', 'public');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE video_status AS ENUM ('draft', 'ready', 'uploading', 'processing', 'scheduled', 'published', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE upload_job_status AS ENUM ('pending', 'uploading', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE idea_format AS ENUM ('long_form', 'short_form', 'series');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE idea_status AS ENUM ('saved', 'in_progress', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    plan_tier plan_tier NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CONNECTED CHANNELS TABLE
CREATE TABLE IF NOT EXISTS public.connected_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    youtube_channel_id TEXT NOT NULL,
    title TEXT NOT NULL,
    custom_url TEXT,
    thumbnail_url TEXT,
    subscriber_count BIGINT NOT NULL DEFAULT 0,
    video_count INTEGER NOT NULL DEFAULT 0,
    view_count BIGINT NOT NULL DEFAULT 0,
    refresh_token TEXT, -- Encrypted / Protected token on server
    access_token TEXT,
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, youtube_channel_id)
);

-- 5. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.connected_channels(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Untitled Video',
    description TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    privacy_status video_privacy NOT NULL DEFAULT 'private',
    status video_status NOT NULL DEFAULT 'draft',
    youtube_video_id TEXT,
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    video_file_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. VIDEO METADATA STUDIO TABLE
CREATE TABLE IF NOT EXISTS public.video_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    niche TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    primary_keyword TEXT NOT NULL,
    secondary_keywords TEXT[] DEFAULT '{}',
    preferred_tone TEXT DEFAULT 'engaging',
    language TEXT DEFAULT 'English',
    titles JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    hashtags TEXT[] DEFAULT '{}',
    pinned_comment TEXT DEFAULT '',
    chapters JSONB DEFAULT '[]'::jsonb,
    thumbnail_ideas JSONB DEFAULT '[]'::jsonb,
    quality_score JSONB NOT NULL DEFAULT '{"overall": 0, "clarity": 0, "relevance": 0, "readability": 0, "keywordCoverage": 0, "critique": []}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. UPLOAD JOBS TABLE
CREATE TABLE IF NOT EXISTS public.upload_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES public.connected_channels(id) ON DELETE CASCADE,
    status upload_job_status NOT NULL DEFAULT 'pending',
    progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    bytes_uploaded BIGINT NOT NULL DEFAULT 0,
    total_bytes BIGINT NOT NULL DEFAULT 0,
    youtube_upload_url TEXT,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. THUMBNAIL ASSETS TABLE
CREATE TABLE IF NOT EXISTS public.thumbnail_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    prompt TEXT,
    text_overlay TEXT,
    style TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. CONTENT IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.content_ideas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.connected_channels(id) ON DELETE SET NULL,
    niche TEXT NOT NULL,
    title TEXT NOT NULL,
    hook TEXT NOT NULL,
    outline JSONB NOT NULL DEFAULT '[]'::jsonb,
    format idea_format NOT NULL DEFAULT 'long_form',
    status idea_status NOT NULL DEFAULT 'saved',
    suggested_keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. ANALYTICS SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES public.connected_channels(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    views BIGINT NOT NULL DEFAULT 0,
    watch_time_hours NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    avg_view_duration_seconds NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    impressions BIGINT,
    ctr_percent NUMERIC(5,2),
    subscribers_gained INTEGER NOT NULL DEFAULT 0,
    metrics_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(channel_id, snapshot_date)
);

-- 11. SUBSCRIPTIONS & USAGE RECORDS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_tier plan_tier NOT NULL DEFAULT 'free',
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_date VARCHAR(7) NOT NULL, -- e.g. '2026-11'
    metadata_generations_count INTEGER NOT NULL DEFAULT 0,
    ai_ideas_count INTEGER NOT NULL DEFAULT 0,
    video_uploads_count INTEGER NOT NULL DEFAULT 0,
    connected_channels_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, period_date)
);

-- 12. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_connected_channels_user ON public.connected_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_user ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_channel ON public.videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_scheduled_at ON public.videos(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_video_metadata_user ON public.video_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_jobs_video ON public.upload_jobs(video_id);
CREATE INDEX IF NOT EXISTS idx_content_ideas_user ON public.content_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_channel_date ON public.analytics_snapshots(channel_id, snapshot_date);

-- 13. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thumbnail_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- 14. ROW LEVEL SECURITY POLICIES
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Connected Channels
CREATE POLICY "Users can view own channels" ON public.connected_channels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own channels" ON public.connected_channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channels" ON public.connected_channels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own channels" ON public.connected_channels FOR DELETE USING (auth.uid() = user_id);

-- Videos
CREATE POLICY "Users can view own videos" ON public.videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own videos" ON public.videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own videos" ON public.videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own videos" ON public.videos FOR DELETE USING (auth.uid() = user_id);

-- Video Metadata
CREATE POLICY "Users can view own metadata" ON public.video_metadata FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metadata" ON public.video_metadata FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metadata" ON public.video_metadata FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own metadata" ON public.video_metadata FOR DELETE USING (auth.uid() = user_id);

-- Upload Jobs
CREATE POLICY "Users can view own upload jobs" ON public.upload_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own upload jobs" ON public.upload_jobs FOR ALL USING (auth.uid() = user_id);

-- Thumbnail Assets
CREATE POLICY "Users can view own thumbnails" ON public.thumbnail_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own thumbnails" ON public.thumbnail_assets FOR ALL USING (auth.uid() = user_id);

-- Content Ideas
CREATE POLICY "Users can view own ideas" ON public.content_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ideas" ON public.content_ideas FOR ALL USING (auth.uid() = user_id);

-- Analytics Snapshots (Scoped via user_id on connected_channels)
CREATE POLICY "Users can view analytics for their channels" ON public.analytics_snapshots
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.connected_channels
        WHERE public.connected_channels.id = public.analytics_snapshots.channel_id
        AND public.connected_channels.user_id = auth.uid()
    )
);

-- Subscriptions & Usage
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage" ON public.usage_records FOR SELECT USING (auth.uid() = user_id);

-- 15. AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, plan_tier)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        'free'
    );
    INSERT INTO public.subscriptions (user_id, plan_tier, status)
    VALUES (new.id, 'free', 'active');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
