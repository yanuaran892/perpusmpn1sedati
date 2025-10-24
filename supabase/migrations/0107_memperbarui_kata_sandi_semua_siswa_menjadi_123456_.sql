UPDATE public.siswa
SET password = crypt('123456', gen_salt('bf'));