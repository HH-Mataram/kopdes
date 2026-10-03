'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { fmt } from '../lib/hitung'
import type { Status, Tipe } from '../lib/hitung'

// Satu keluarga ikon: viewBox 24, garis 1.7, ujung bulat. Tanpa dependency.
type IconProps = { size?: number }

function Svg({ size = 16, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/* ---------- ikon KPI ---------- */
export function IconRevenue({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5h.01M18 14.5h.01" />
    </Svg>
  )
}
export function IconSO({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="5" y="4.5" width="14" height="17" rx="2" />
      <path d="M9 4.5v-1h6v1" />
      <path d="m9 13.2 2.2 2.2 4.3-4.4" />
    </Svg>
  )
}
export function IconRE({ size }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="9.5" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <path d="M19 8v6M16 11h6" />
    </Svg>
  )
}
export function IconPS({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M2.5 9a14 14 0 0 1 19 0" />
      <path d="M5.8 12.6a9.4 9.4 0 0 1 12.4 0" />
      <path d="M9.2 16.1a4.8 4.8 0 0 1 5.6 0" />
      <path d="M12 19.6h.01" />
    </Svg>
  )
}
export function IconPayload({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 12h4l2.5-7 5 14 2.5-7h4" />
    </Svg>
  )
}
export function IconLIS({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M5 20v-3M10 20v-7M15 20V9M20 20V4" />
    </Svg>
  )
}

/* ---------- ikon kontrol ---------- */
export function IconPin({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  )
}
export function IconCalendar({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Svg>
  )
}
export function IconList({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    </Svg>
  )
}
export function IconInbox({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13" />
      <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-5.5a3 3 0 0 1-6 0H3z" />
    </Svg>
  )
}
export function IconTable({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M3.5 15h17M9.5 4.5v15" />
    </Svg>
  )
}
export function IconGrid({ size }: IconProps) {
  return (
    <Svg size={size}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  )
}
export function IconBars({ size }: IconProps) {
  return (
    <Svg size={size}>
      <path d="M6 20V11M12 20V5M18 20v-6" />
    </Svg>
  )
}

/* ---------- status: bentuk berbeda + warna, aman untuk buta warna ---------- */
export const STATUS_LABEL: Record<Status, string> = {
  on: 'On Track',
  watch: 'Watch',
  risk: 'At Risk',
  none: 'Belum ada data',
}

function StatusShape({ status, size }: { status: Status; size: number }) {
  if (status === 'on') {
    return (
      <Svg size={size}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12.3 2.8 2.8 5.4-5.6" />
      </Svg>
    )
  }
  if (status === 'watch') {
    return (
      <Svg size={size}>
        <path d="M12 4 2.8 19.5h18.4L12 4z" />
        <path d="M12 10v4.2M12 17.2h.01" />
      </Svg>
    )
  }
  if (status === 'risk') {
    return (
      <Svg size={size}>
        <path d="M8.2 3h7.6L21 8.2v7.6L15.8 21H8.2L3 15.8V8.2L8.2 3z" />
        <path d="M12 8v4.5M12 15.8h.01" />
      </Svg>
    )
  }
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
      <path d="M8.5 12h7" />
    </Svg>
  )
}

// Ikon status saja (untuk baris tabel)
export function StatusIcon({ status, size = 15 }: { status: Status; size?: number }) {
  const label = STATUS_LABEL[status]
  return (
    <span className={`sico st-${status}`} role="img" aria-label={label} title={label}>
      <StatusShape status={status} size={size} />
    </span>
  )
}

// Chip status: ikon + teks
export function Chip({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <span className={`chip st-${status}`}>
      <StatusShape status={status} size={13} />
      {children}
    </span>
  )
}

/* ---------- sparkline batang: nilai tiap minggu ---------- */
export function Spark({ values }: { values: (number | null)[] }) {
  const w = 48
  const h = 20
  const n = values.length
  const gap = 3
  const bw = (w - gap * (n - 1)) / n
  const ada = values.filter((v): v is number => v !== null)
  const max = ada.length ? Math.max(...ada) : 0
  let terakhir = -1
  values.forEach((v, i) => {
    if (v !== null) terakhir = i
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false" className="spark">
      {values.map((v, i) => {
        const x = i * (bw + gap)
        if (v === null || max <= 0) {
          return <line key={i} x1={x} x2={x + bw} y1={h - 1} y2={h - 1} stroke="#C3CAD3" strokeWidth={1.5} strokeDasharray="2 2" />
        }
        const bh = Math.max(2, (v / max) * (h - 2))
        return <rect key={i} x={x} y={h - bh} width={bw} height={bh} rx={1.5} fill={i === terakhir ? '#1D5A9E' : '#BCD0E6'} />
      })}
    </svg>
  )
}


/* ---------- angka ringkas untuk sumbu grafik ---------- */
export function ringkasAngka(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e9) return `${fmt(n / 1e9, 1)} M`
  if (a >= 1e6) return `${fmt(n / 1e6, 1)} jt`
  if (a >= 1e4) return `${fmt(n / 1e3, 0)} rb`
  return fmt(n, a < 10 ? 1 : 0)
}

function niceMax(v: number): number {
  if (v <= 0) return 1
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * p >= v) return m * p
  }
  return 10 * p
}

/* ---------- donut capaian (ACH) ---------- */
export function Donut({ pct, status, size = 88 }: { pct: number | null; status: Status; size?: number }) {
  const r = 38
  const c = 2 * Math.PI * r
  const p = pct === null ? 0 : Math.max(0, Math.min(pct, 100))
  return (
    <div className={`donut st-${status}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e6eaf0" strokeWidth={10} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          style={{ stroke: 'var(--bar)' }}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${(p / 100) * c} ${c}`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="donut-t">
        <b>{pct === null ? '–' : `${Math.round(pct)}%`}</b>
        <span>ACH</span>
      </div>
    </div>
  )
}

/* ---------- tren mingguan: actual vs target ----------
   Kumulatif : batang = actual kumulatif sampai akhir minggu, garis putus = target pace
               (target x hari berjalan / jumlah hari bulan).
   Level     : batang = level tiap minggu, garis putus = target (datar). */
type TrendProps = {
  minggu: { awal: number; akhir: number }[]
  values: (number | null)[]
  tipe: Tipe
  target: number | null
  jalan: number
  totalHari: number
  label: string
}

export function TrendChart({ minggu, values, tipe, target, jalan, totalHari, label }: TrendProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(520)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const baca = () => setW(Math.max(260, Math.floor(el.getBoundingClientRect().width)))
    baca()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(baca)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = minggu.length
  const kum = tipe === 'Kumulatif'
  let terakhir = -1
  values.forEach((v, i) => {
    if (v !== null) terakhir = i
  })
  let akum = 0
  const bars: (number | null)[] = values.map((v, i) => {
    if (!kum) return v
    if (v !== null) akum += v
    return i <= terakhir ? akum : null
  })
  const pts: (number | null)[] = minggu.map((m) => {
    if (target === null) return null
    if (!kum) return target
    const hari = jalan >= m.awal && jalan < m.akhir ? jalan : m.akhir
    return (target * hari) / Math.max(totalHari, 1)
  })

  const semua: number[] = []
  bars.forEach((v) => {
    if (v !== null) semua.push(v)
  })
  pts.forEach((v) => {
    if (v !== null) semua.push(v)
  })

  const H = 184
  const ml = 46
  const mr = 12
  const mt = 14
  const mb = 24
  const pw = w - ml - mr
  const ph = H - mt - mb
  const ada = semua.length > 0
  const nice = niceMax(ada ? Math.max(...semua) * 1.08 : 1)
  const y = (v: number) => mt + ph * (1 - v / nice)
  const band = pw / n
  const bw = Math.min(40, band * 0.5)
  const cx = (i: number) => ml + band * i + band / 2
  const ticks = (ada ? [0, 1, 2, 3, 4] : [0]).map((t) => (nice / 4) * t)
  const cw = jalan > 0 && jalan < totalHari ? minggu.findIndex((m) => jalan >= m.awal && jalan <= m.akhir) : -1

  let garis = ''
  pts.forEach((v, i) => {
    if (v === null) return
    garis += `${garis === '' ? 'M' : 'L'}${cx(i).toFixed(1)},${y(v).toFixed(1)} `
  })

  return (
    <div ref={ref} className="trendbox">
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={`Tren mingguan ${label}`}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={ml} x2={w - mr} y1={y(t)} y2={y(t)} stroke="#edf0f4" strokeWidth={1} />
            <text x={ml - 6} y={y(t) + 3.5} textAnchor="end" fontSize={10} fill="#5b6773">
              {ringkasAngka(t)}
            </text>
          </g>
        ))}
        {bars.map((v, i) => {
          if (v === null) return null
          const top = y(v)
          return (
            <rect key={i} x={cx(i) - bw / 2} y={top} width={bw} height={Math.max(y(0) - top, 1)} rx={3} fill="#1d5a9e" opacity={i === cw ? 0.78 : 1}>
              <title>{`W${i + 1}: ${fmt(v, 2)}${kum ? ' (kumulatif)' : ''}`}</title>
            </rect>
          )
        })}
        {!kum && target !== null ? (
          <line x1={ml} x2={w - mr} y1={y(target)} y2={y(target)} stroke="#3b4856" strokeWidth={1.5} strokeDasharray="4 3" />
        ) : null}
        {kum && garis !== '' ? (
          <>
            <path d={garis} fill="none" stroke="#3b4856" strokeWidth={1.5} strokeDasharray="4 3" />
            {pts.map((v, i) => (v === null ? null : <circle key={i} cx={cx(i)} cy={y(v)} r={3} fill="#fff" stroke="#3b4856" strokeWidth={1.4} />))}
          </>
        ) : null}
        {terakhir >= 0 && bars[terakhir] !== null ? (
          <text x={cx(terakhir)} y={y(bars[terakhir] as number) - 5} textAnchor="middle" fontSize={10.5} fontWeight={600} fill="#0f1b2a">
            {fmt(bars[terakhir] as number, 1)}
          </text>
        ) : null}
        {minggu.map((m, i) => (
          <text key={i} x={cx(i)} y={H - 7} textAnchor="middle" fontSize={10.5} fontWeight={i === cw ? 700 : 400} fill={i === cw ? '#1d5a9e' : '#5b6773'}>
            {`W${i + 1}`}
          </text>
        ))}
        {!ada ? (
          <text x={w / 2} y={H / 2} textAnchor="middle" fontSize={12} fill="#a3adb9">
            Belum ada data
          </text>
        ) : null}
      </svg>
    </div>
  )
}
