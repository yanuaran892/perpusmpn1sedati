CREATE OR REPLACE FUNCTION public.admin_update_student(
    p_id_nis text,
    p_nama text,
    p_kelas text,
    p_admin_id bigint,              -- Dipindahkan ke sini (tanpa default)
    p_admin_username text,          -- Dipindahkan ke sini (tanpa default)
    p_email text DEFAULT NULL,
    p_new_password text DEFAULT NULL,
    p_max_peminjaman integer DEFAULT 3,
    p_status_siswa character varying DEFAULT 'aktif',
    p_status_peminjaman character varying DEFAULT 'aktif'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp', 'extensions'
AS $$
DECLARE
    v_hashed_password text;
    v_salt text;
BEGIN
    -- Update student details
    UPDATE public.siswa
    SET
        nama = p_nama,
        kelas = p_kelas,
        email = p_email,
        max_peminjaman = p_max_peminjaman,
        status_siswa = p_status_siswa,
        status_peminjaman = p_status_peminjaman
    WHERE id_nis = p_id_nis;

    -- If a new password is provided, hash and update it
    IF p_new_password IS NOT NULL AND p_new_password <> '' THEN
        SELECT extensions.gen_salt('bf') INTO v_salt;
        SELECT extensions.crypt(p_new_password, v_salt) INTO v_hashed_password;
        UPDATE public.siswa
        SET password = v_hashed_password
        WHERE id_nis = p_id_nis;
    END IF;

    -- Log admin action
    INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
    VALUES (p_admin_id, p_admin_username, 'UPDATE_STUDENT', 'Admin updated student: ' || p_nama || ' (NIS: ' || p_id_nis || ')', 'SUCCESS');

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
        VALUES (p_admin_id, p_admin_username, 'UPDATE_STUDENT', 'Failed to update student ' || p_nama || ' (NIS: ' || p_id_nis || '): ' || SQLERRM, 'FAILED');
        RAISE WARNING 'Error in admin_update_student function: %', SQLERRM;
        RETURN FALSE;
END;
$$;