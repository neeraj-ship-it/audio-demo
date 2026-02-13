-- AUDIOFLIX DATABASE SCHEMA
-- Production-ready schema for audio content platform

-- Main Content Table
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Romance, Horror, Thriller, Comedy, Spiritual, Motivation
    thumbnail_url TEXT,
    audio_url TEXT,
    story_text TEXT,
    duration INTEGER, -- in seconds
    plays_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    release_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, published
    voices_used JSONB, -- Array of voice IDs used
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Content Calendar
CREATE TABLE IF NOT EXISTS content_schedule (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES content(id),
    scheduled_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    title_preview VARCHAR(255),
    status VARCHAR(20) DEFAULT 'planned', -- planned, generating, ready, published
    created_at TIMESTAMP DEFAULT NOW()
);

-- Voice Library (Track which voices we use)
CREATE TABLE IF NOT EXISTS voices (
    id SERIAL PRIMARY KEY,
    voice_id VARCHAR(100) UNIQUE NOT NULL, -- ElevenLabs voice ID
    voice_name VARCHAR(100),
    gender VARCHAR(20),
    age_range VARCHAR(50),
    accent VARCHAR(50),
    best_for VARCHAR(100), -- Romance, Action, Narration, Comedy
    is_active BOOLEAN DEFAULT true
);

-- Content Analytics
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES content(id),
    event_type VARCHAR(50), -- play, like, share, complete
    user_session VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Special Occasions Calendar
CREATE TABLE IF NOT EXISTS special_occasions (
    id SERIAL PRIMARY KEY,
    occasion_name VARCHAR(100),
    occasion_date DATE,
    preferred_category VARCHAR(50),
    is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_release_date ON content(release_date);
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_schedule_date ON content_schedule(scheduled_date);

-- Insert default voice profiles
INSERT INTO voices (voice_id, voice_name, gender, age_range, accent, best_for) VALUES
('pNInz6obpgDQGcFmaJgB', 'Adam', 'Male', '30-40', 'American', 'Narration, Romance'),
('21m00Tcm4TlvDq8ikWAM', 'Rachel', 'Female', '25-35', 'American', 'Romance, Drama'),
('EXAVITQu4vr4xnSDxMaL', 'Bella', 'Female', '20-30', 'American', 'Young, Emotional'),
('ErXwobaYiN019PkySvjV', 'Antoni', 'Male', '35-45', 'American', 'Thriller, Horror'),
('MF3mGyEYCl7XYWbV9V6O', 'Elli', 'Female', '25-35', 'British', 'Spiritual, Calm'),
('TxGEqnHWrfWFTfGW9XjX', 'Josh', 'Male', '30-40', 'American', 'Motivation, Action');

-- Insert special occasions
INSERT INTO special_occasions (occasion_name, occasion_date, preferred_category, is_active) VALUES
('Valentine Day', '2026-02-14', 'Romance', true),
('Holi', '2026-03-14', 'Comedy', true),
('Diwali', '2026-11-12', 'Spiritual', true),
('New Year', '2026-01-01', 'Motivation', true),
('Halloween', '2026-10-31', 'Horror', true),
('Christmas', '2026-12-25', 'Spiritual', true);
