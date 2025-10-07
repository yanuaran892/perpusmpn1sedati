UPDATE public.admin
SET password = crypt('admin123', gen_salt('bf'))
WHERE username = 'admin';