-- NEURA 2026 Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up tables with Row Level Security (RLS)

-- 1. Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    team_size TEXT,
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
    leader_id TEXT,
    leader_name TEXT,
    leader_phone TEXT,
    leader_email TEXT,
    members JSONB NOT NULL,
    qr_code_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    team_id TEXT PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
    present BOOLEAN DEFAULT FALSE,
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

-- Enable Public Read & Insert Access for Web Portal
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public all access on teams" ON public.teams FOR ALL USING (true);
CREATE POLICY "Allow public all access on attendance" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Allow public all access on scores" ON public.scores FOR ALL USING (true);
