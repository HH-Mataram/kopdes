# Dashboard KOPDES

Situs publik (tanpa login), hanya membaca tabel `kopdes_*` di Supabase.
Data diisi dari Excel SharePoint lewat Power Automate -> `/api/kopdes-sync` di KIPER.

## Variabel lingkungan (Vercel -> Settings -> Environment Variables)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Hanya anon key. Jangan pasang `SUPABASE_SECRET_KEY` di project ini.
Setiap kali variabel diubah, wajib Redeploy.

## Yang sering diubah

- Isi 6 card di atas: konstanta `KARTU` di `app/Dashboard.tsx`
- Tahun dan daftar bulan: `lib/hitung.ts` (`TAHUN`, `BULAN`)
- Rumus ACH, RR, dan status: `hitungBaris` di `lib/hitung.ts`
