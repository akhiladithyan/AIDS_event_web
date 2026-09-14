-- NEURA 2026 Supabase Database Schema & Migration Queries
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 0. Quick Migration Query for Existing Databases (Run this if you get missing column errors):
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_teams NUMERIC DEFAULT 20;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS college TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS lunch BOOLEAN DEFAULT FALSE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS snacks BOOLEAN DEFAULT FALSE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS student_scans JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.judging_locks ADD COLUMN IF NOT EXISTS revealed_places JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.judges ADD COLUMN IF NOT EXISTS access_levels JSONB DEFAULT '["judge"]'::jsonb;

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    team_size TEXT,
    max_teams NUMERIC DEFAULT 20,
    venue TEXT,
    time TEXT,
    prize TEXT,
    description TEXT,
    rules JSONB,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Teams & Members Table
CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY,
    team_name TEXT NOT NULL,
    event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
    event_title TEXT,
    college TEXT,
    department TEXT,
    leader_id TEXT,
    leader_name TEXT,
    leader_phone TEXT,
    leader_email TEXT,
    members JSONB NOT NULL,
    qr_code_token TEXT UNIQUE,
    qr_code_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    team_id TEXT PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
    present BOOLEAN DEFAULT FALSE,
    lunch BOOLEAN DEFAULT FALSE,
    snacks BOOLEAN DEFAULT FALSE,
    student_scans JSONB DEFAULT '{}'::jsonb,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    marked_by TEXT
);

-- 4. Judges Table
CREATE TABLE IF NOT EXISTS public.judges (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    assigned_events JSONB
);

-- 5. Scores Table
CREATE TABLE IF NOT EXISTS public.scores (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    team_id TEXT REFERENCES public.teams(id) ON DELETE CASCADE,
    judge_id TEXT REFERENCES public.judges(id) ON DELETE CASCADE,
    criteria JSONB NOT NULL,
    total_score NUMERIC DEFAULT 0,
    feedback TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Judging Locks Table
CREATE TABLE IF NOT EXISTS public.judging_locks (
    event_id TEXT PRIMARY KEY REFERENCES public.events(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Passwords Table
CREATE TABLE IF NOT EXISTS public.passwords (
    id TEXT PRIMARY KEY DEFAULT 'system',
    admin TEXT NOT NULL DEFAULT 'admin123',
    manager TEXT NOT NULL DEFAULT 'manager123'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judging_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all operations for web portal access)
DROP POLICY IF EXISTS "Allow public all access on events" ON public.events;
DROP POLICY IF EXISTS "Allow public read access on events" ON public.events;
CREATE POLICY "Allow public all access on events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on teams" ON public.teams;
CREATE POLICY "Allow public all access on teams" ON public.teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on attendance" ON public.attendance;
CREATE POLICY "Allow public all access on attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on judges" ON public.judges;
CREATE POLICY "Allow public all access on judges" ON public.judges FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on scores" ON public.scores;
CREATE POLICY "Allow public all access on scores" ON public.scores FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on judging_locks" ON public.judging_locks;
CREATE POLICY "Allow public all access on judging_locks" ON public.judging_locks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all access on passwords" ON public.passwords;
CREATE POLICY "Allow public all access on passwords" ON public.passwords FOR ALL USING (true) WITH CHECK (true);

