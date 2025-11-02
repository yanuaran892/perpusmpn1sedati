CREATE OR REPLACE FUNCTION public.update_siswa_password(p_id_nis text, p_old_password text, p_new_password text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp', 'extensions'
AS $function$
DECLARE
  v_current_hashed_password text;
BEGIN
  -- Get the current hashed password for the given NIS
  SELECT password INTO v_current_hashed_password
  FROM public.siswa
  WHERE id_nis = p_id_nis;

  -- Check if the old password matches the stored hashed password
  IF v_current_hashed_password IS NULL OR v_current_hashed_password <> extensions.crypt(p_old_password, v_current_hashed_password) THEN
    RAISE EXCEPTION 'Old password does not match or student not found.';
  END IF;

  -- Update the password with the new hashed password
  UPDATE public.siswa
  SET password = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  WHERE id_nis = p_id_nis;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in update_siswa_password function: %', SQLERRM;
    RETURN FALSE;
END;
$function$;