import { createClient } from '@supabase/supabase-js'
import Dashboard from './Dashboard'
import { TAHUN } from '../lib/hitung'
import type { AksiRow, RealRow, TargetRow } from '../lib/hitung'

export const dynamic = 'force-dynamic'

function Pesan({ judul, isi }: { judul: string; isi: string }) {
  return (
    <>
      <div className="bar">
        <b>KOPDES</b>
      </div>
      <div className="wrap">
        <div className="panel pesan">
          <h1>{judul}</h1>
          <p>{isi}</p>
        </div>
      </div>
    </>
  )
}

export default async function Page() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return <Pesan judul="Konfigurasi belum lengkap" isi="Variabel Supabase belum diisi di Vercel, atau belum Redeploy." />
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const [a, t, r, s] = await Promise.all([
    supabase
      .from('kopdes_aksi')
      .select('kode, commitment, action, satuan, pic, tipe, urutan')
      .eq('aktif', true)
      .order('urutan', { ascending: true }),
    supabase.from('kopdes_target').select('kode, periode, target'),
    supabase.from('kopdes_realisasi').select('kode, periode, minggu, nilai'),
    supabase.from('kopdes_sync').select('terakhir').eq('id', 1).maybeSingle(),
  ])

  if (a.error || t.error || r.error) {
    return <Pesan judul="Data belum bisa dimuat" isi="Terjadi gangguan saat membaca database. Coba muat ulang beberapa saat lagi." />
  }

  const aksi = (a.data ?? []) as AksiRow[]
  if (aksi.length === 0) {
    return <Pesan judul="Belum ada data" isi="Data Action Plan belum disinkronkan dari Excel." />
  }

  const targets = ((t.data ?? []) as TargetRow[]).map((x) => ({ ...x, target: Number(x.target) }))
  const realisasi = ((r.data ?? []) as RealRow[]).map((x) => ({ ...x, minggu: Number(x.minggu), nilai: Number(x.nilai) }))

  // Tanggal hari ini di WITA, format YYYY-MM-DD
  const hariIni = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  // Bulan awal: bulan berjalan jika dalam Okt-Des, selain itu batas terdekat
  const [y, m] = hariIni.split('-').map(Number)
  let bulanAwal = 0
  if (y > TAHUN || (y === TAHUN && m >= 12)) bulanAwal = 2
  else if (y === TAHUN && m >= 10) bulanAwal = m - 10

  const terakhir = (s.data as { terakhir?: string } | null)?.terakhir
  const sinkron = terakhir
    ? new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(terakhir)) + ' WITA'
    : null

  return (
    <Dashboard
      aksi={aksi}
      targets={targets}
      realisasi={realisasi}
      hariIni={hariIni}
      bulanAwal={bulanAwal}
      sinkron={sinkron}
    />
  )
}
