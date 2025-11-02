CREATE OR REPLACE FUNCTION public.admin_add_student(
    p_id_nis text,
    p_nama text,
    p_kelas text,
    p_password text,          -- Dipindahkan ke sini (tanpa default)
    p_admin_id bigint,        -- Dipindahkan ke sini (tanpa default)
    p_admin_username text,    -- Dipindahkan ke sini (tanpa default)
    p_email text DEFAULT NULL,
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
    -- Generate salt and hash password
    SELECT extensions.gen_salt('bf') INTO v_salt;
    SELECT extensions.crypt(p_password, v_salt) INTO v_hashed_password;

    -- Insert new student
    INSERT INTO public.siswa (
        id_nis,
        nama,
        kelas,
        email,
        password,
        total_pinjam,
        sedang_pinjam,
        max_peminjaman,
        total_denda,
        status_siswa,
        status_peminjaman
    ) VALUES (
        p_id_nis,
        p_nama,
        p_kelas,
        p_email,
        v_hashed_password,
        0, -- Default total_pinjam
        0, -- Default sedang_pinjam
        p_max_peminjaman,
        0.00, -- Default total_denda
        p_status_siswa,
        p_status_peminjaman
    );

    -- Log admin action
    INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
    VALUES (p_admin_id, p_admin_username, 'ADD_STUDENT', 'Admin added new student: ' || p_nama || ' (NIS: ' || p_id_nis || ')', 'SUCCESS');

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO public.admin_logs (admin_id, admin_username, action_type, description, status)
        VALUES (p_admin_id, p_admin_username, 'ADD_STUDENT', 'Failed to add new student ' || p_nama || ' (NIS: ' || p_id_nis || '): ' || SQLERRM, 'FAILED');
        RAISE WARNING 'Error in admin_add_student function: %', SQLERRM;
        RETURN FALSE;
END;
$$;