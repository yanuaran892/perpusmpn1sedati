CREATE OR REPLACE FUNCTION public.approve_return_request_admin(p_sirkulasi_id integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_sirkulasi_record public.sirkulasi;
  v_current_sedang_pinjam INTEGER;
BEGIN
  -- Get sirkulasi record
  SELECT * INTO v_sirkulasi_record
  FROM public.sirkulasi
  WHERE id_sirkulasi = p_sirkulasi_id;

  IF v_sirkulasi_record IS NULL THEN
    RAISE EXCEPTION 'Permintaan sirkulasi ID % tidak ditemukan.', p_sirkulasi_id;
  END IF;

  IF v_sirkulasi_record.status <> 'return_pending' THEN
    RAISE EXCEPTION 'Permintaan pengembalian ID % tidak dalam status menunggu persetujuan.', p_sirkulasi_id;
  END IF;

  -- Update sirkulasi status to 'dikembalikan'
  -- Denda calculation and application already happened in request_return_book
  UPDATE public.sirkulasi
  SET
    status = 'dikembalikan'
    -- denda is already set by request_return_book
  WHERE id_sirkulasi = p_sirkulasi_id;

  -- Increment buku.jumlah_buku
  UPDATE public.buku
  SET jumlah_buku = (jumlah_buku::integer + 1)::text
  WHERE id_buku = v_sirkulasi_record.id_buku;

  -- Decrement siswa.sedang_pinjam
  SELECT sedang_pinjam INTO v_current_sedang_pinjam
  FROM public.siswa
  WHERE id_nis = v_sirkulasi_record.id_nis;

  UPDATE public.siswa
  SET
    sedang_pinjam = GREATEST(0, v_current_sedang_pinjam - 1)
    -- total_denda is already updated by request_return_book
  WHERE id_nis = v_sirkulasi_record.id_nis;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error in approve_return_request_admin function: %', SQLERRM;
    RETURN FALSE;
END;
$function$