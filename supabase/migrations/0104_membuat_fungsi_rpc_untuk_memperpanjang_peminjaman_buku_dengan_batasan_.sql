CREATE OR REPLACE FUNCTION public.extend_borrow_period(
    p_sirkulasi_id INTEGER,
    p_id_nis TEXT,
    p_extension_days INTEGER DEFAULT 3
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
DECLARE
    v_sirkulasi_record public.sirkulasi;
    v_max_extensions INTEGER := 3; -- Maksimal 3 kali perpanjangan
    v_max_borrow_days INTEGER := 3; -- Default maksimal hari peminjaman
    v_new_tanggal_kembali TIMESTAMP WITH TIME ZONE;
    v_admin_max_borrow_days INTEGER;
    v_admin_max_extension_days INTEGER;
BEGIN
    -- Get admin settings for max_borrow_days and max_extension_days
    -- Assuming there's a settings table or a way to retrieve these values
    -- For now, hardcode or fetch from a placeholder
    -- SELECT value::integer INTO v_admin_max_borrow_days FROM public.settings WHERE key = 'max_borrow_days';
    -- SELECT value::integer INTO v_admin_max_extension_days FROM public.settings WHERE key = 'max_extension_days';
    
    -- Placeholder for admin settings if no settings table exists yet
    v_admin_max_borrow_days := 3; -- Default to 3 days if not set by admin
    v_admin_max_extension_days := 3; -- Default to 3 days if not set by admin

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

    IF v_sirkulasi_record.status <> 'dipinjam' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Buku tidak dalam status dipinjam dan tidak dapat diperpanjang.');
    END IF;

    IF v_sirkulasi_record.jumlah_perpanjangan >= v_max_extensions THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Buku ini telah mencapai batas maksimal perpanjangan (' || v_max_extensions || ' kali).');
    END IF;

    -- Calculate new tanggal_kembali
    v_new_tanggal_kembali := v_sirkulasi_record.tanggal_kembali + (p_extension_days || ' days')::INTERVAL;

    -- Update sirkulasi record
    UPDATE public.sirkulasi
    SET
        tanggal_kembali = v_new_tanggal_kembali,
        jumlah_perpanjangan = v_sirkulasi_record.jumlah_perpanjangan + 1
    WHERE id_sirkulasi = p_sirkulasi_id;

    RETURN jsonb_build_object('success', TRUE, 'message', 'Masa peminjaman berhasil diperpanjang hingga ' || TO_CHAR(v_new_tanggal_kembali, 'DD Mon YYYY HH24:MI') || '.');

EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in extend_borrow_period function: %', SQLERRM;
        RETURN jsonb_build_object('success', FALSE, 'message', 'Terjadi kesalahan tak terduga saat memperpanjang masa peminjaman: ' || SQLERRM);
END;
$$;