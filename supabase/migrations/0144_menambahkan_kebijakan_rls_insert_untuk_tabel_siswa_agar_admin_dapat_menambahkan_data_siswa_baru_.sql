CREATE POLICY "Admins can insert new student data" ON public.siswa
FOR INSERT TO authenticated WITH CHECK (true);