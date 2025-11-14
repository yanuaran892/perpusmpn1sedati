-- Drop the old function first
DROP FUNCTION IF EXISTS borrow_book(TEXT, INTEGER, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);

-- Recreate with library status check
CREATE OR REPLACE FUNCTION borrow_book(
  p_id_nis TEXT,
  p_id_buku INTEGER,
  p_tanggal_pinjam TIMESTAMP WITH TIME ZONE,
  p_tanggal_kembali TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_jumlah_buku INTEGER;
  v_sedang_pinjam INTEGER;
  v_max_peminjaman INTEGER;
  v_status_peminjaman TEXT;
  v_library_status JSONB;
BEGIN
  -- Check library status
  SELECT get_library_status() INTO v_library_status;
  
  IF NOT (v_library_status->>'is_open')::BOOLEAN THEN
    IF (v_library_status->>'is_holiday')::BOOLEAN THEN
      RAISE EXCEPTION 'Perpustakaan tutup karena hari libur: %. Peminjaman tidak dapat dilakukan.', 
        v_library_status->>'holiday_name';
    ELSE
      RAISE EXCEPTION 'Perpustakaan sedang tutup. Peminjaman tidak dapat dilakukan saat ini.';
    END IF;
  END IF;

  -- Set session variable for RLS
  PERFORM set_config('app.current_nis', p_id_nis, false);

  -- Check if book is available
  SELECT jumlah_buku::INTEGER INTO v_jumlah_buku
  FROM buku
  WHERE id_buku = p_id_buku;

  IF v_jumlah_buku IS NULL THEN
    RAISE EXCEPTION 'Buku tidak ditemukan.';
  END IF;

  IF v_jumlah_buku <= 0 THEN
    RAISE EXCEPTION 'Buku tidak tersedia untuk dipinjam.';
  END IF;

  -- Check student's borrowing status
  SELECT sedang_pinjam, max_peminjaman, status_peminjaman
  INTO v_sedang_pinjam, v_max_peminjaman, v_status_peminjaman
  FROM siswa
  WHERE id_nis = p_id_nis;

  IF v_status_peminjaman = 'nonaktif' THEN
    RAISE EXCEPTION 'Status peminjaman Anda sedang nonaktif. Silakan hubungi admin.';
  END IF;

  IF v_sedang_pinjam >= v_max_peminjaman THEN
    RAISE EXCEPTION 'Anda telah mencapai batas maksimal peminjaman (% buku).', v_max_peminjaman;
  END IF;

  -- Insert circulation record with 'pending' status
  INSERT INTO sirkulasi (
    id_nis,
    id_buku,
    tanggal_pinjam,
    tanggal_kembali,
    status,
    denda,
    jumlah_perpanjangan
  ) VALUES (
    p_id_nis,
    p_id_buku,
    p_tanggal_pinjam,
    p_tanggal_kembali,
    'pending',
    0,
    0
  );

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

COMMENT ON FUNCTION borrow_book IS 'Request to borrow a book with library status check (requires admin approval)';