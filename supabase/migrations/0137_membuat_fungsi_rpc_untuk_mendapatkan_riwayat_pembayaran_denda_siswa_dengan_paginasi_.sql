CREATE OR REPLACE FUNCTION public.get_paginated_student_fine_payments(
    p_id_nis text,
    limit_value integer,
    offset_value integer
)
RETURNS TABLE(
    id_pembayaran integer,
    jumlah_bayar numeric,
    tanggal_bayar timestamp with time zone,
    status_pembayaran text,
    bukti_pembayaran_url text,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    pd.id_pembayaran,
    pd.jumlah_bayar,
    pd.tanggal_bayar,
    pd.status_pembayaran,
    pd.bukti_pembayaran_url,
    pd.created_at
  FROM
    public.pembayaran_denda pd
  WHERE
    pd.id_nis = p_id_nis
  ORDER BY pd.created_at DESC
  LIMIT limit_value
  OFFSET offset_value;
END;
$function$;