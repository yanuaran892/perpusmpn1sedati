CREATE POLICY "Admins can view all student data" ON public.siswa
FOR SELECT TO authenticated USING (true);