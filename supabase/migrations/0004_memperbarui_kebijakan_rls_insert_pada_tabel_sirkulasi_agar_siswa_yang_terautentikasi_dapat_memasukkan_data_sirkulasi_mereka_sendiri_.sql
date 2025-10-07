-- Drop the existing policy if it has a null definition or is incorrect
DROP POLICY IF EXISTS "Siswa can insert their own circulation data" ON public.sirkulasi;

-- Create a new policy that allows authenticated students to insert their own circulation data
CREATE POLICY "Siswa can insert their own circulation data" ON public.sirkulasi
FOR INSERT TO authenticated WITH CHECK ((id_nis)::text = current_setting('app.current_nis'::text, true));