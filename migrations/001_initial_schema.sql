-- Esahayak Database Schema
-- Run this in Supabase Dashboard > SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create buyers table
CREATE TABLE IF NOT EXISTS buyers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL CHECK (length(full_name) >= 2),
    email text CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone text NOT NULL CHECK (phone ~ '^\d{10,15}$'),
    city text,
    property_type text CHECK (property_type IN ('Apartment', 'Villa', 'Plot', 'Commercial')),
    bhk integer CHECK (bhk > 0),
    purpose text CHECK (purpose IN ('Buy', 'Rent')),
    budget_min integer CHECK (budget_min >= 0),
    budget_max integer CHECK (budget_max >= 0),
    timeline text CHECK (timeline IN ('Immediate', '1-3 months', '3-6 months', '6+ months')),
    source text,
    notes text,
    tags text[] DEFAULT '{}',
    owner_id uuid NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure budget_max >= budget_min when both are provided
    CONSTRAINT valid_budget_range CHECK (
        budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min
    ),
    
    -- BHK required for Apartment/Villa
    CONSTRAINT bhk_required_for_apt_villa CHECK (
        (property_type IN ('Apartment', 'Villa') AND bhk IS NOT NULL) OR
        (property_type NOT IN ('Apartment', 'Villa'))
    )
);

-- Create buyer_history table for audit trail
CREATE TABLE IF NOT EXISTS buyer_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id uuid NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
    action text NOT NULL,
    details text,
    created_at timestamptz DEFAULT now(),
    created_by uuid NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buyers_owner_id ON buyers(owner_id);
CREATE INDEX IF NOT EXISTS idx_buyers_created_at ON buyers(created_at);
CREATE INDEX IF NOT EXISTS idx_buyers_phone ON buyers(phone);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);
CREATE INDEX IF NOT EXISTS idx_buyers_city ON buyers(city);
CREATE INDEX IF NOT EXISTS idx_buyers_property_type ON buyers(property_type);
CREATE INDEX IF NOT EXISTS idx_buyers_timeline ON buyers(timeline);
CREATE INDEX IF NOT EXISTS idx_buyer_history_buyer_id ON buyer_history(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_history_created_at ON buyer_history(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for buyers table
DROP TRIGGER IF EXISTS update_buyers_updated_at ON buyers;
CREATE TRIGGER update_buyers_updated_at
    BEFORE UPDATE ON buyers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
INSERT INTO buyers (
    full_name, email, phone, city, property_type, bhk, purpose, 
    budget_min, budget_max, timeline, source, notes, tags, owner_id
) VALUES 
(
    'John Doe', 
    'john@example.com', 
    '9876543210', 
    'Mumbai', 
    'Apartment', 
    2, 
    'Buy', 
    5000000, 
    8000000, 
    '3-6 months', 
    'Website', 
    'Looking for 2BHK in Bandra area',
    ARRAY['urgent', 'bandra'],
    gen_random_uuid()
),
(
    'Jane Smith', 
    'jane@example.com', 
    '9876543211', 
    'Delhi', 
    'Villa', 
    3, 
    'Buy', 
    10000000, 
    15000000, 
    '6+ months', 
    'Referral', 
    'Prefers gated community',
    ARRAY['luxury', 'gated'],
    gen_random_uuid()
);

-- Verify tables created successfully
SELECT 'Buyers table created' as status, count(*) as sample_records FROM buyers;
SELECT 'History table created' as status, count(*) as records FROM buyer_history;