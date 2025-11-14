-- Create library_status table to track if library is open or closed
CREATE TABLE IF NOT EXISTS public.library_status (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_open BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by_admin_id INTEGER,
  updated_by_admin_username TEXT,
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert default row
INSERT INTO public.library_status (id, is_open) VALUES (1, true)
ON CONFLICT (id) DO NOTHING;

-- Create holidays table for Indonesian national holidays
CREATE TABLE IF NOT EXISTS public.holidays (
  id SERIAL PRIMARY KEY,
  holiday_date DATE NOT NULL UNIQUE,
  holiday_name TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false, -- For holidays that repeat yearly (e.g., Independence Day)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_admin_id INTEGER,
  created_by_admin_username TEXT
);

-- Enable RLS
ALTER TABLE public.library_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for library_status
-- Allow authenticated users to read library status
CREATE POLICY "Allow authenticated users to read library status"
ON public.library_status
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for holidays
-- Allow authenticated users to read holidays
CREATE POLICY "Allow authenticated users to read holidays"
ON public.holidays
FOR SELECT
TO authenticated
USING (true);

-- Insert common Indonesian national holidays for 2024-2025
INSERT INTO public.holidays (holiday_date, holiday_name, is_recurring) VALUES
  ('2024-01-01', 'Tahun Baru Masehi', true),
  ('2024-02-08', 'Isra Mikraj Nabi Muhammad SAW', false),
  ('2024-02-10', 'Tahun Baru Imlek', false),
  ('2024-03-11', 'Hari Suci Nyepi', false),
  ('2024-03-29', 'Wafat Isa Al-Masih', false),
  ('2024-04-11', 'Hari Raya Idul Fitri', false),
  ('2024-04-12', 'Hari Raya Idul Fitri', false),
  ('2024-05-01', 'Hari Buruh Internasional', true),
  ('2024-05-09', 'Kenaikan Isa Al-Masih', false),
  ('2024-05-23', 'Hari Raya Waisak', false),
  ('2024-06-01', 'Hari Lahir Pancasila', true),
  ('2024-06-17', 'Hari Raya Idul Adha', false),
  ('2024-07-07', 'Tahun Baru Islam', false),
  ('2024-08-17', 'Hari Kemerdekaan RI', true),
  ('2024-09-16', 'Maulid Nabi Muhammad SAW', false),
  ('2024-12-25', 'Hari Raya Natal', true),
  ('2025-01-01', 'Tahun Baru Masehi', true),
  ('2025-01-29', 'Tahun Baru Imlek', false),
  ('2025-03-29', 'Hari Suci Nyepi', false),
  ('2025-03-31', 'Hari Raya Idul Fitri', false),
  ('2025-04-01', 'Hari Raya Idul Fitri', false),
  ('2025-04-18', 'Wafat Isa Al-Masih', false),
  ('2025-05-01', 'Hari Buruh Internasional', true),
  ('2025-05-12', 'Hari Raya Waisak', false),
  ('2025-05-29', 'Kenaikan Isa Al-Masih', false),
  ('2025-06-01', 'Hari Lahir Pancasila', true),
  ('2025-06-07', 'Hari Raya Idul Adha', false),
  ('2025-06-27', 'Tahun Baru Islam', false),
  ('2025-08-17', 'Hari Kemerdekaan RI', true),
  ('2025-09-05', 'Maulid Nabi Muhammad SAW', false),
  ('2025-12-25', 'Hari Raya Natal', true)
ON CONFLICT (holiday_date) DO NOTHING;

-- Create index for faster holiday lookups
CREATE INDEX IF NOT EXISTS idx_holidays_date ON public.holidays(holiday_date);

COMMENT ON TABLE public.library_status IS 'Stores the current open/closed status of the library';
COMMENT ON TABLE public.holidays IS 'Stores Indonesian national holidays when library is closed';