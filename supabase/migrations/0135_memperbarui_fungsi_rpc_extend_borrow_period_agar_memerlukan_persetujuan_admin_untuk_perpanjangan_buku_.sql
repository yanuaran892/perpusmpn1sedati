CREATE OR REPLACE FUNCTION public.extend_borrow_period(p_sirkulasi_id integer, p_id_nis text, p_extension_days integer DEFAULT 3)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
    v_sirkulasi_record public.sirkulasi;
    v_max_extensions INTEGER := 3; -- Maksimal 3 kali perpanjangan
    v_new_tanggal_kembali TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get sirkulasi record
    SELECT * INTO v_sirkulasi_record
    FROM public.sirkulasi
    WHERE id_sirkulasi = p_sirkulasi_id;

    IF v_sirkulasi_record IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Sirkulasi ID ' || p_sirkulasi_id || ' tidak ditemukan.');
    END IF;

    IF v_sirkulasi_record.id_nis <> p_id_nis THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Anda tidak memiliki izin untuk memperpanjang buku ini.');
    END IF;

    IF v_sirkulasi_record.status NOT IN ('dipinjam', 'extension_pending') THEN -- Allow extending from 'dipinjam' or if already 'extension_pending' (to re-request)
        RETURN jsonb_build_object('success', FALSE, 'message', 'Buku tidak dalam status dipinjam dan tidak dapat diperpanjang.');
    END IF;

    IF v_sirkulasi_record.jumlah_perpanjangan >= v_max_extensions THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Buku ini telah mencapai batas maksimal perpanjangan (' || v_max_extensions || ' kali).');
    END IF;

    -- Calculate new requested tanggal_kembali
    v_new_tanggal_kembali := v_sirkulasi_record.tanggal_kembali + (p_extension_days || ' days')::INTERVAL;

    -- Update sirkulasi record to 'extension_pending' status
    UPDATE public.sirkulasi
    SET
        status = 'extension_pending',
        tanggal_kembali_request = v_new_tanggal_kembali,
        -- jumlah_perpanjangan is incremented only upon approval to avoid counting pending requests
        extension_rejected = FALSE -- Reset rejection flag
    WHERE id_sirkulasi = p_sirkulasi_id;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Permintaan perpanjangan masa peminjaman berhasil diajukan hingga ' || TO_CHAR(v_new_tanggal_kembali, 'DD Mon YYYY HH24:MI') || '. Menunggu persetujuan admin.');

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in extend_borrow_period function: %', SQLERRM;
        RETURN jsonb_build_object('success', FALSE, 'message', 'Terjadi kesalahan tak terduga saat mengajukan perpanjangan masa peminjaman: ' || SQLERRM);
END;
$function$;