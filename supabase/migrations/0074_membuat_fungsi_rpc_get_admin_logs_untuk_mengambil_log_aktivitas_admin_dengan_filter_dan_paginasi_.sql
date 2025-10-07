CREATE OR REPLACE FUNCTION public.get_admin_logs(
    searchkey text DEFAULT '',
    filter_status text DEFAULT 'all',
    limit_value integer DEFAULT 10,
    offset_value integer DEFAULT 0
)
RETURNS SETOF admin_logs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    al.*
  FROM
    public.admin_logs al
  WHERE
    (searchkey = '' OR al.admin_username ILIKE '%' || searchkey || '%' OR al.description ILIKE '%' || searchkey || '%' OR al.action_type ILIKE '%' || searchkey || '%')
    AND (filter_status = 'all' OR al.status = filter_status)
  ORDER BY al.created_at DESC
  LIMIT limit_value
  OFFSET offset_value;
END;
$function$;