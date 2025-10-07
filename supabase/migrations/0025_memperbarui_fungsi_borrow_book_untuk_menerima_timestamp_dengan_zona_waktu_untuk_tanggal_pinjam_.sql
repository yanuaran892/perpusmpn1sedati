CREATE OR REPLACE FUNCTION public.borrow_book(p_id_nis text, p_id_buku integer, p_tanggal_pinjam TIMESTAMP WITH TIME ZONE, p_tanggal_kembali date)
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
    p_tanggal_pinjam, -- Now accepts TIMESTAMP WITH TIME ZONE
    p_tanggal_kembali,
    'pending',
    0
  );

  -- DO NOT update buku.jumlah_buku or siswa.sedang_pinjam here.
  -- These updates will happen upon admin approval.

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in borrow_book function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;