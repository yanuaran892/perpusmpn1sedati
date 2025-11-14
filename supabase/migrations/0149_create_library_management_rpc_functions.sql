-- Function to toggle library status (open/close)
CREATE OR REPLACE FUNCTION toggle_library_status(
  p_admin_id INTEGER,
  p_admin_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status BOOLEAN;
  v_new_status BOOLEAN;
BEGIN
  -- Get current status
  SELECT is_open INTO v_current_status
  FROM public.library_status
  WHERE id = 1;

  -- Toggle status
  v_new_status := NOT v_current_status;

  -- Update status
  UPDATE public.library_status
  SET 
    is_open = v_new_status,
    last_updated = NOW(),
    updated_by_admin_id = p_admin_id,
    updated_by_admin_username = p_admin_username
  WHERE id = 1;

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (
    p_admin_id,
    p_admin_username,
    'TOGGLE_LIBRARY_STATUS',
    'Admin ' || p_admin_username || ' changed library status to ' || 
    CASE WHEN v_new_status THEN 'OPEN' ELSE 'CLOSED' END,
    'SUCCESS'
  );

  RETURN jsonb_build_object(
    'success', true,
    'is_open', v_new_status,
    'message', 'Status perpustakaan berhasil diubah menjadi ' || 
               CASE WHEN v_new_status THEN 'BUKA' ELSE 'TUTUP' END
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Gagal mengubah status perpustakaan: ' || SQLERRM
    );
END;
$$;

-- Function to get library status
CREATE OR REPLACE FUNCTION get_library_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status RECORD;
  v_is_holiday BOOLEAN;
  v_holiday_name TEXT;
BEGIN
  -- Get library status
  SELECT * INTO v_status
  FROM public.library_status
  WHERE id = 1;

  -- Check if today is a holiday
  SELECT EXISTS(
    SELECT 1 FROM public.holidays
    WHERE holiday_date = CURRENT_DATE
  ) INTO v_is_holiday;

  -- Get holiday name if it's a holiday
  IF v_is_holiday THEN
    SELECT holiday_name INTO v_holiday_name
    FROM public.holidays
    WHERE holiday_date = CURRENT_DATE
    LIMIT 1;
  END IF;

  RETURN jsonb_build_object(
    'is_open', v_status.is_open AND NOT v_is_holiday,
    'manual_status', v_status.is_open,
    'is_holiday', v_is_holiday,
    'holiday_name', v_holiday_name,
    'last_updated', v_status.last_updated,
    'updated_by', v_status.updated_by_admin_username
  );
END;
$$;

-- Function to add a holiday
CREATE OR REPLACE FUNCTION add_holiday(
  p_holiday_date DATE,
  p_holiday_name TEXT,
  p_is_recurring BOOLEAN,
  p_admin_id INTEGER,
  p_admin_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.holidays (
    holiday_date,
    holiday_name,
    is_recurring,
    created_by_admin_id,
    created_by_admin_username
  ) VALUES (
    p_holiday_date,
    p_holiday_name,
    p_is_recurring,
    p_admin_id,
    p_admin_username
  );

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (
    p_admin_id,
    p_admin_username,
    'ADD_HOLIDAY',
    'Admin ' || p_admin_username || ' added holiday: ' || p_holiday_name || ' on ' || p_holiday_date,
    'SUCCESS'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Hari libur berhasil ditambahkan'
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Tanggal ini sudah terdaftar sebagai hari libur'
    );
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Gagal menambahkan hari libur: ' || SQLERRM
    );
END;
$$;

-- Function to delete a holiday
CREATE OR REPLACE FUNCTION delete_holiday(
  p_holiday_id INTEGER,
  p_admin_id INTEGER,
  p_admin_username TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_holiday_name TEXT;
BEGIN
  -- Get holiday name before deleting
  SELECT holiday_name INTO v_holiday_name
  FROM public.holidays
  WHERE id = p_holiday_id;

  IF v_holiday_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Hari libur tidak ditemukan'
    );
  END IF;

  DELETE FROM public.holidays
  WHERE id = p_holiday_id;

  -- Log admin action
  INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
  VALUES (
    p_admin_id,
    p_admin_username,
    'DELETE_HOLIDAY',
    'Admin ' || p_admin_username || ' deleted holiday: ' || v_holiday_name,
    'SUCCESS'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Hari libur berhasil dihapus'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Gagal menghapus hari libur: ' || SQLERRM
    );
END;
$$;

-- Function to get all holidays
CREATE OR REPLACE FUNCTION get_all_holidays()
RETURNS TABLE (
  id INTEGER,
  holiday_date DATE,
  holiday_name TEXT,
  is_recurring BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.holiday_date,
    h.holiday_name,
    h.is_recurring,
    h.created_at
  FROM public.holidays h
  ORDER BY h.holiday_date ASC;
END;
$$;

-- Function to check if a date is a holiday
CREATE OR REPLACE FUNCTION is_holiday(p_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.holidays
    WHERE holiday_date = p_date
  );
END;
$$;

-- Function to calculate business days (excluding holidays and weekends)
CREATE OR REPLACE FUNCTION calculate_business_days(
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_days INTEGER := 0;
  v_current_date DATE;
  v_end_date DATE;
BEGIN
  v_current_date := p_start_date::DATE;
  v_end_date := p_end_date::DATE;

  WHILE v_current_date <= v_end_date LOOP
    -- Check if it's not a weekend (Saturday=6, Sunday=0)
    IF EXTRACT(DOW FROM v_current_date) NOT IN (0, 6) THEN
      -- Check if it's not a holiday
      IF NOT is_holiday(v_current_date) THEN
        v_days := v_days + 1;
      END IF;
    END IF;
    
    v_current_date := v_current_date + INTERVAL '1 day';
  END LOOP;

  RETURN v_days;
END;
$$;

COMMENT ON FUNCTION toggle_library_status IS 'Toggle library open/closed status';
COMMENT ON FUNCTION get_library_status IS 'Get current library status including holiday check';
COMMENT ON FUNCTION add_holiday IS 'Add a new holiday to the system';
COMMENT ON FUNCTION delete_holiday IS 'Delete a holiday from the system';
COMMENT ON FUNCTION get_all_holidays IS 'Get all holidays in the system';
COMMENT ON FUNCTION is_holiday IS 'Check if a specific date is a holiday';
COMMENT ON FUNCTION calculate_business_days IS 'Calculate business days between two dates excluding weekends and holidays';