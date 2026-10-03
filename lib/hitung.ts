// Logika hitung Dashboard KOPDES. Murni fungsi, tanpa akses database.

export const TAHUN = 2026

export const BULAN = [
  { kode: 'Okt', nama: 'Oktober', bulan: 10 },
  { kode: 'Nov', nama: 'November', bulan: 11 },
  { kode: 'Des', nama: 'Desember', bulan: 12 },
]

export const CLUSTER = ['Lombok', 'Sumbawa Barat', 'Sumbawa Timur']

export type Tipe = 'Kumulatif' | 'Level'
export type Status = 'on' | 'watch' | 'risk' | 'none'

export type AksiRow = {
  cluster: string
  kode: string
  commitment: string
  action: string
  satuan: string | null
  pic: string | null
  tipe: Tipe
  urutan: number
}
export type TargetRow = { cluster: string; kode: string; periode: string; target: number }
export type RealRow = { cluster: string; kode: string; periode: string; minggu: number; nilai: number }

export type Hitung = {
  target: number | null
  minggu: (number | null)[]
  total: number | null
  rr: number | null
  rrPct: number | null
  ach: number | null
  pace: number
  status: Status
}

// Jumlah nilai yang terisi. Semua kosong -> null (belum ada data), bukan 0.
export function jumlahTerisi(vals: (number | null)[]): number | null {
  const ada = vals.filter((v): v is number => v !== null)
  return ada.length === 0 ? null : ada.reduce((p, q) => p + q, 0)
}

// Gabungkan nilai beberapa cluster untuk satu action (saat All Cluster).
// Jumlahkan, kecuali metrik persen (satuan % atau pp) yang dirata-rata.
// Semua kosong -> null (belum ada data).
export function gabung(vals: (number | null)[], rata: boolean): number | null {
  const ada = vals.filter((v): v is number => v !== null)
  if (ada.length === 0) return null
  const total = ada.reduce((p, q) => p + q, 0)
  return rata ? total / ada.length : total
}

export function periodeStr(bulan: number): string {
  return `${TAHUN}-${String(bulan).padStart(2, '0')}-01`
}

// Minggu Senin-Minggu. W1 = dari tanggal 1 sampai Minggu pertama.
export function rentangMinggu(tahun: number, bulan: number): { awal: number; akhir: number }[] {
  const hari = new Date(tahun, bulan, 0).getDate()
  const out: { awal: number; akhir: number }[] = []
  let awal = 1
  for (let d = 1; d <= hari; d++) {
    const dow = new Date(tahun, bulan - 1, d).getDay() // 0 = Minggu
    if (dow === 0 || d === hari) {
      out.push({ awal, akhir: d })
      awal = d + 1
    }
  }
  return out
}

// Hari berjalan memakai H-1 (sama seperti KIPER). hariIni = 'YYYY-MM-DD' WITA.
export function hariBerjalan(hariIni: string, tahun: number, bulan: number): { jalan: number; total: number } {
  const [y, m, d] = hariIni.split('-').map(Number)
  const total = new Date(tahun, bulan, 0).getDate()
  const sekarang = y * 12 + m
  const tujuan = tahun * 12 + bulan
  if (sekarang > tujuan) return { jalan: total, total }
  if (sekarang < tujuan) return { jalan: 0, total }
  return { jalan: Math.min(Math.max(d - 1, 0), total), total }
}

export function hitungBaris(
  tipe: Tipe,
  target: number | null,
  minggu: (number | null)[],
  jalan: number,
  totalHari: number
): Hitung {
  const terisi = minggu.filter((v): v is number => v !== null)
  let total: number | null = null
  if (terisi.length > 0) {
    total = tipe === 'Level' ? terisi[terisi.length - 1] : terisi.reduce((p, q) => p + q, 0)
  }

  const pace = tipe === 'Level' ? 100 : totalHari > 0 ? (jalan / totalHari) * 100 : 0
  const ach = target !== null && target > 0 && total !== null ? (total / target) * 100 : null

  let rr: number | null = null
  let rrPct: number | null = null
  if (tipe === 'Kumulatif' && total !== null && jalan > 0) {
    rr = (total / jalan) * totalHari
    rrPct = target !== null && target > 0 ? (rr / target) * 100 : null
  }

  let status: Status = 'none'
  if (ach !== null && pace > 0) {
    status = ach >= pace ? 'on' : ach >= pace * 0.9 ? 'watch' : 'risk'
  }
  return { target, minggu, total, rr, rrPct, ach, pace, status }
}

export function statusRR(rrPct: number | null): Status {
  if (rrPct === null) return 'none'
  return rrPct >= 100 ? 'on' : rrPct >= 90 ? 'watch' : 'risk'
}

// Format angka Indonesia: 5.370 dan 4,43. null -> tanda hubung.
export function fmt(n: number | null, dec = 2): string {
  if (n === null) return '–'
  const k = Math.pow(10, dec)
  let s = (Math.round(n * k) / k).toFixed(dec)
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '')
  const [bulat, desimal] = s.split('.')
  const ribuan = bulat.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return desimal ? `${ribuan},${desimal}` : ribuan
}
