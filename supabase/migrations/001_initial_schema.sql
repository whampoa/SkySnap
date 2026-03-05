-- SkySnap Database Schema
-- Drone Services Marketplace for NSW Australia

-- Enable PostGIS extension for geography type
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'pilot');
CREATE TYPE job_category AS ENUM ('Real Estate', 'Roof Check', 'Agriculture');
CREATE TYPE job_status AS ENUM ('open', 'assigned', 'completed');
CREATE TYPE bid_status AS ENUM ('pending', 'accepted', 'rejected');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  arn_number TEXT, -- Aviation Reference Number (for pilots)
  is_repl_verified BOOLEAN DEFAULT FALSE, -- Remote Pilot Licence verification
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category job_category NOT NULL,
  status job_status DEFAULT 'open',
  location_name TEXT NOT NULL,
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  budget_min INTEGER NOT NULL CHECK (budget_min >= 0),
  budget_max INTEGER NOT NULL CHECK (budget_max >= budget_min),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Open jobs are viewable by everyone"
  ON jobs FOR SELECT
  USING (status = 'open' OR client_id = auth.uid());

CREATE POLICY "Clients can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Clients can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own open jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = client_id AND status = 'open');

-- ============================================
-- BIDS TABLE
-- ============================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  pilot_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  message TEXT,
  delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
  status bid_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, pilot_id) -- One bid per pilot per job
);

-- Enable RLS on bids
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Bids policies
CREATE POLICY "Pilots can view their own bids"
  ON bids FOR SELECT
  USING (
    pilot_id = auth.uid() OR
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = bids.job_id AND jobs.client_id = auth.uid())
  );

CREATE POLICY "Pilots can insert bids on open jobs"
  ON bids FOR INSERT
  WITH CHECK (
    auth.uid() = pilot_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pilot') AND
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND status = 'open')
  );

CREATE POLICY "Pilots can update their pending bids"
  ON bids FOR UPDATE
  USING (auth.uid() = pilot_id AND status = 'pending')
  WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Job owners can update bid status"
  ON bids FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM jobs WHERE jobs.id = bids.job_id AND jobs.client_id = auth.uid())
  );

CREATE POLICY "Pilots can delete their pending bids"
  ON bids FOR DELETE
  USING (auth.uid() = pilot_id AND status = 'pending');

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to accept a bid and reject others
CREATE OR REPLACE FUNCTION accept_bid(bid_id UUID)
RETURNS VOID AS $$
DECLARE
  v_job_id UUID;
  v_client_id UUID;
BEGIN
  -- Get job_id from the bid
  SELECT job_id INTO v_job_id FROM bids WHERE id = bid_id;
  
  -- Get client_id from the job
  SELECT client_id INTO v_client_id FROM jobs WHERE id = v_job_id;
  
  -- Verify the current user is the job owner
  IF v_client_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the job owner can accept bids';
  END IF;
  
  -- Accept the selected bid
  UPDATE bids SET status = 'accepted' WHERE id = bid_id;
  
  -- Reject all other bids for this job
  UPDATE bids SET status = 'rejected' WHERE job_id = v_job_id AND id != bid_id;
  
  -- Update job status to assigned
  UPDATE jobs SET status = 'assigned' WHERE id = v_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_coordinates ON jobs USING GIST(coordinates);
CREATE INDEX idx_bids_job_id ON bids(job_id);
CREATE INDEX idx_bids_pilot_id ON bids(pilot_id);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================
-- SEED DATA FOR NSW REGIONS (Optional)
-- ============================================
COMMENT ON TABLE profiles IS 'User profiles for clients and pilots';
COMMENT ON TABLE jobs IS 'Drone service job listings';
COMMENT ON TABLE bids IS 'Pilot bids on jobs';
COMMENT ON COLUMN profiles.arn_number IS 'CASA Aviation Reference Number';
COMMENT ON COLUMN profiles.is_repl_verified IS 'Remote Pilot Licence verification status';
