-- Mengaktifkan RLS pada tabel siswa jika belum diaktifkan
alter table public.siswa enable row level security;

-- Kebijakan RLS untuk mengizinkan pengguna anonim memasukkan data siswa baru
-- Hanya diizinkan jika status_siswa diatur ke 'pending'
create policy "Allow anon insert for registration"
on public.siswa for insert
to anon
with check (status_siswa = 'pending');