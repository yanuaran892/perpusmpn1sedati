-- Modify existing borrow_book function
CREATE OR REPLACE FUNCTION public.borrow_book(p_id_nis text, p_id_buku integer, p_tanggal_pinjam date, p_tanggal_kembali date)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_current_jumlah_buku integer;
  v_current_sedang_pinjam integer;
  v_max_peminjaman integer;
BEGIN
  -- Set app.current_nis for RLS policies that might be active even within SECURITY DEFINER functions
  PERFORM set_config('app.current_nis', p_id_nis, false);

  -- Check student's borrowing limits
  SELECT sedang_pinjam, max_peminjaman INTO v_current_sedang_pinjam, v_max_peminjaman
  FROM public.siswa
  WHERE id_nis = p_id_nis;

  IF v_current_sedang_pinjam >= v_max_peminjaman THEN
    RAISE EXCEPTION 'Anda telah mencapai batas maksimal peminjaman (% buku).', v_max_peminjaman;
  END IF;

  -- Check book availability
  SELECT jumlah_buku::integer INTO v_current_jumlah_buku
  FROM public.buku
  WHERE id_buku = p_id_buku;

  IF v_current_jumlah_buku <= 0 THEN
    RAISE EXCEPTION 'Buku tidak tersedia untuk dipinjam.';
  END IF;

  -- Insert into sirkulasi table with 'pending' status
  INSERT INTO public.sirkulasi (
    id_nis,
    id_buku,
    tanggal_pinjam,
    tanggal_kembali,
    status,
    denda
  ) VALUES (
    p_id_nis,
    p_id_buku,
    p_tanggal_pinjam,
    p_tanggal_kembali,
    'pending', -- Status changed to 'pending'
    0
  );

  -- DO NOT update buku.jumlah_buku or siswa.sedang_pinjam here.
  -- These updates will happen upon admin approval.

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in borrow_book function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;

-- Create approve_borrow_request function
CREATE OR REPLACE FUNCTION public.approve_borrow_request(p_sirkulasi_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_sirkulasi_record public.sirkulasi;
  v_current_jumlah_buku integer;
  v_current_sedang_pinjam integer;
  v_current_total_pinjam integer;
BEGIN
  -- Get sirkulasi record
  SELECT * INTO v_sirkulasi_record
  FROM public.sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id;

  IF v_sirkulasi_record IS NULL THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak ditemukan.', p_sirkulasi_id;
  END IF;

  IF v_sirkulasi_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak dalam status pending.', p_sirkulasi_id;
  END IF;

  -- Check book availability again (in case it changed since request)
  SELECT jumlah_buku::integer INTO v_current_jumlah_buku
  FROM public.buku
  WHERE id_buku = v_sirkulasi_record.id_buku;

  IF v_current_jumlah_buku <= 0 THEN
    RAISE EXCEPTION 'Buku tidak tersedia untuk dipinjam saat ini.';
  END IF;

  -- Update sirkulasi status to 'dipinjam'
  UPDATE public.sirkulasi
  SET status = 'dipinjam'
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- Decrement buku.jumlah_buku
  UPDATE public.buku
  SET jumlah_buku = (jumlah_buku::integer - 1)::text
  WHERE id_buku = v_sirkulasi_record.id_buku;

  -- Increment siswa.sedang_pinjam and siswa.total_pinjam
  SELECT sedang_pinjam, total_pinjam INTO v_current_sedang_pinjam, v_current_total_pinjam
  FROM public.siswa
  WHERE id_nis = v_sirkulasi_record.id_nis;

  UPDATE public.siswa
  SET
    sedang_pinjam = v_current_sedang_pinjam + 1,
    total_pinjam = v_current_total_pinjam + 1
  WHERE id_nis = v_sirkulasi_record.id_nis;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in approve_borrow_request function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;

-- Create reject_borrow_request function
CREATE OR REPLACE FUNCTION public.reject_borrow_request(p_sirkulasi_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_sirkulasi_record public.sirkulasi;
BEGIN
  -- Get sirkulasi record
  SELECT * INTO v_sirkulasi_record
  FROM public.sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id;

  IF v_sirkulasi_record IS NULL THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak ditemukan.', p_sirkulasi_id;
  END IF;

  IF v_sirkulasi_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak dalam status pending.', p_sirkulasi_id;
  END IF;

  -- Update sirkulasi status to 'rejected'
  UPDATE public.sirkulasi
  SET status = 'rejected'
  WHERE id_sirkulasi = p_sirkulasi_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in reject_borrow_request function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;