'use client'

import { useMemo, useState } from 'react'
import { BULAN, TAHUN, fmt, hariBerjalan, hitungBaris, periodeStr, rentangMinggu, statusRR } from '../lib/hitung'
import type { AksiRow, Hitung, RealRow, Status, TargetRow } from '../lib/hitung'

type Props = {
  aksi: AksiRow[]
  targets: TargetRow[]
  realisasi: RealRow[]
  hariIni: string
  bulanAwal: number
  sinkron: string | null
}

type BarisTampil = { a: AksiRow; h: Hitung }

const WARNA: Record<Status, string> = {
  on: '#1D5A9E',
  watch: '#8A5100',
  risk: '#A92A1E',
  none: '#5B6773',
}
const BAR: Record<Status, string> = {
  on: '#2F6FB5',
  watch: '#E08A12',
  risk: '#C8392D',
  none: '#C3CAD3',
}
const MUTED = '#8A949F'

// Isi 6 card di atas masih menyusul. Ganti label/nilai/keterangan di sini.
const KARTU = [1, 2, 3, 4, 5, 6].map((i) => ({ label: `Card ${i}`, nilai: '—', ket: 'Isi menyusul' }))

function Angka({ v, dec }: { v: number | null; dec?: number }) {
  return <>{fmt(v, dec)}</>
}

export default function Dashboard({ aksi, targets, realisasi, hariIni, bulanAwal, sinkron }: Props) {
  const [kIdx, setKIdx] = useState(0)
  const [bIdx, setBIdx] = useState(bulanAwal)

  const komitmen = useMemo(() => {
    const peta = new Map<string, AksiRow[]>()
    for (const a of aksi) {
      const daftar = peta.get(a.commitment)
      if (daftar) daftar.push(a)
      else peta.set(a.commitment, [a])
    }
    return Array.from(peta, ([nama, daftar]) => ({ nama, daftar }))
  }, [aksi])

  const tMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of targets) m.set(`${t.kode}|${t.periode}`, t.target)
    return m
  }, [targets])

  const rMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of realisasi) m.set(`${r.kode}|${r.periode}|${r.minggu}`, r.nilai)
    return m
  }, [realisasi])

  const bulan = BULAN[bIdx]
  const periode = periodeStr(bulan.bulan)
  const minggu = useMemo(() => rentangMinggu(TAHUN, bulan.bulan), [bulan.bulan])
  const { jalan, total: totalHari } = hariBerjalan(hariIni, TAHUN, bulan.bulan)
  const paceHariIni = totalHari > 0 ? Math.round((jalan / totalHari) * 100) : 0

  const kAman = Math.min(kIdx, Math.max(komitmen.length - 1, 0))
  const terpilih = komitmen[kAman]

  const rows: BarisTampil[] = useMemo(() => {
    if (!terpilih) return []
    return terpilih.daftar.map((a) => {
      const target = tMap.get(`${a.kode}|${periode}`) ?? null
      const mingguan = minggu.map((_, i) => rMap.get(`${a.kode}|${periode}|${i + 1}`) ?? null)
      return { a, h: hitungBaris(a.tipe, target, mingguan, jalan, totalHari) }
    })
  }, [terpilih, tMap, rMap, periode, minggu, jalan, totalHari])

  if (!terpilih) return null

  const ringkas = (() => {
    const nilai = rows.filter((r) => r.h.ach !== null).map((r) => Math.min(r.h.ach as number, 100))
    const rata = nilai.length ? Math.round(nilai.reduce((p, q) => p + q, 0) / nilai.length) : null
    const pic = Array.from(new Set(terpilih.daftar.map((a) => a.pic).filter((p): p is string => !!p))).join(' · ')
    return `${pic ? `PIC ${pic} · ` : ''}${rows.length} action · ACH rata-rata ${rata === null ? '–' : `${rata}%`}`
  })()

  const grid = {
    gridTemplateColumns: `minmax(0, 1fr) 64px repeat(${minggu.length}, 50px) 64px 108px 120px`,
  }

  return (
    <>
      <div className="bar">
        <b>KOPDES</b>
        <span>{sinkron ? `Data per ${sinkron}` : 'Belum ada sinkron'}</span>
      </div>

      <div className="wrap">
        <div>
          <h1>Action Plan Q4 2026</h1>
          <div className="sub">
            Lombok Mataram · actual per minggu vs target {bulan.nama}
            {jalan > 0 && jalan < totalHari ? ` · hari ke-${jalan} dari ${totalHari}` : ''}
          </div>
        </div>

        <div className="cards">
          {KARTU.map((k) => (
            <div className="card" key={k.label}>
              <div className="lbl">{k.label}</div>
              <div className="val">{k.nilai}</div>
              <div className="note">{k.ket}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="toolbar">
            <div className="pilih">
              <label htmlFor="komitmen">Commitment</label>
              <select id="komitmen" className="sel" value={String(kAman)} onChange={(e) => setKIdx(Number(e.target.value))}>
                {komitmen.map((k, i) => (
                  <option key={k.nama} value={String(i)}>
                    {`${i + 1}. ${k.nama} (${k.daftar.length} action)`}
                  </option>
                ))}
              </select>
              <span className="ring">{ringkas}</span>
            </div>
            <div className="seg" role="group" aria-label="Pilih bulan">
              <span className="lbl">Target</span>
              <div className="segbtn">
                {BULAN.map((b, i) => (
                  <button key={b.kode} type="button" className={i === bIdx ? 'aktif' : ''} onClick={() => setBIdx(i)}>
                    {b.kode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tampilan lebar: tabel */}
          <div className="desk">
            <div className="thead">
              <div className="grp" style={grid}>
                <div style={{ gridColumn: `3 / span ${minggu.length + 1}` }} className="grp-label">
                  Actual
                </div>
              </div>
              <div className="hrow" style={grid}>
                <div>Action</div>
                <div className="num">Target</div>
                {minggu.map((w, i) => (
                  <div className="num" key={i}>
                    W{i + 1}
                    <div className="tgl">{w.awal === w.akhir ? w.awal : `${w.awal}–${w.akhir}`}</div>
                  </div>
                ))}
                <div className="num">Total</div>
                <div className="num">RR</div>
                <div>ACH</div>
              </div>
            </div>

            {rows.map(({ a, h }) => (
              <div className="row" style={grid} key={a.kode}>
                <div className="nama">
                  <span className="nm" title={a.action}>
                    {a.action}
                  </span>
                  {a.satuan ? <span className="unit">{a.satuan}</span> : null}
                </div>
                <div className="num" style={{ color: '#3B4856' }}>
                  <Angka v={h.target} />
                </div>
                {h.minggu.map((v, i) => (
                  <div className="num" key={i} style={{ color: v === null ? MUTED : undefined }}>
                    <Angka v={v} />
                  </div>
                ))}
                <div className="num tot">
                  <Angka v={h.total} />
                </div>
                <div className="num" style={{ color: WARNA[statusRR(h.rrPct)] }}>
                  <span className="tot">
                    <Angka v={h.rr} />
                  </span>{' '}
                  <span className="kecil">{h.rrPct === null ? '' : `${Math.round(h.rrPct)}%`}</span>
                </div>
                <div className="ach">
                  <div className="track">
                    <div className="isi" style={{ width: `${Math.min(h.ach ?? 0, 100)}%`, background: BAR[h.status] }} />
                    {h.pace > 0 && h.ach !== null ? <div className="pace" style={{ left: `calc(${h.pace}% - 1px)` }} /> : null}
                  </div>
                  <span className="pct" style={{ color: WARNA[h.status] }}>
                    {h.ach === null ? '–' : `${Math.round(h.ach)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tampilan sempit: daftar kartu */}
          <div className="mob">
            {rows.map(({ a, h }) => (
              <div className="item" key={a.kode}>
                <div className="itop">
                  <div>
                    <span className="nm2">{a.action}</span> {a.satuan ? <span className="unit">{a.satuan}</span> : null}
                  </div>
                  <span className="pct" style={{ color: WARNA[h.status] }}>
                    {h.ach === null ? '–' : `${Math.round(h.ach)}%`}
                  </span>
                </div>
                <div className="track">
                  <div className="isi" style={{ width: `${Math.min(h.ach ?? 0, 100)}%`, background: BAR[h.status] }} />
                  {h.pace > 0 && h.ach !== null ? <div className="pace" style={{ left: `calc(${h.pace}% - 1px)` }} /> : null}
                </div>
                <div className="wk" style={{ gridTemplateColumns: `repeat(${minggu.length}, minmax(0, 1fr))` }}>
                  {h.minggu.map((v, i) => (
                    <div key={i}>
                      <div className="lbl2">W{i + 1}</div>
                      <div style={{ color: v === null ? MUTED : undefined }}>
                        <Angka v={v} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="stat3">
                  <div>
                    <div className="lbl2">Target</div>
                    <div className="mid">
                      <Angka v={h.target} />
                    </div>
                  </div>
                  <div>
                    <div className="lbl2">Total</div>
                    <div className="tot">
                      <Angka v={h.total} />
                    </div>
                  </div>
                  <div>
                    <div className="lbl2">RR</div>
                    <div style={{ color: WARNA[statusRR(h.rrPct)] }}>
                      <span className="tot">
                        <Angka v={h.rr} />
                      </span>{' '}
                      <span className="kecil">{h.rrPct === null ? '' : `${Math.round(h.rrPct)}%`}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="legend">
            <span>
              W = minggu Senin–Minggu, tanggal {bulan.nama}. Sel “–” = belum diisi.
            </span>
            <span>
              RR = proyeksi akhir bulan{jalan > 0 ? ` (Total ÷ ${jalan} hari × ${totalHari} hari)` : ''}, % = RR ÷ target. ACH = Total ÷ target.
            </span>
            {paceHariIni > 0 ? (
              <span className="lg">
                <i className="pace-lg" />
                Posisi seharusnya hari ini ({paceHariIni}%)
              </span>
            ) : null}
            <span>Metrik level (outlet, %): Total = minggu terakhir, RR tidak dihitung.</span>
          </div>
        </div>
      </div>
    </>
  )
}