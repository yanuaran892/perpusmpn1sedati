CREATE POLICY "Admins can view all circulation data" ON public.sirkulasi
FOR SELECT TO authenticated USING (true);