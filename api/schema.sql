-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    firebase_uid TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_description TEXT,
    resume_text TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    match_score INTEGER,
    synthesis_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'created', -- 'created', 'in_progress', 'completed'
    feedback_summary TEXT,
    overall_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    order_index INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    audio_url TEXT,
    transcript TEXT,
    feedback JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Simple policy: Users can only access their own data
-- Note: This requires Supabase Auth to be synced or handled correctly.
-- For now, since we are using a service role key in the backend, we bypass RLS.
-- But if we use the anon key from frontend, we need these.
-- Since we are doing everything via backend API for now, we can skip strict RLS setup or set it to allow all for service role.
