'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  BULAN,
  CLUSTER,
  TAHUN,
  fmt,
  gabung,
  hariBerjalan,
  hitungBaris,
  jumlahTerisi,
  periodeStr,
  rentangMinggu,
  statusRR,
} from '../lib/hitung'
import type { AksiRow, Hitung, RealRow, Status, TargetRow, Tipe } from '../lib/hitung'
import {
  Chip,
  Donut,
  IconBars,
  IconCalendar,
  IconGrid,
  IconInbox,
  IconLIS,
  IconList,
  IconPS,
  IconPayload,
  IconPin,
  IconRE,
  IconRevenue,
  IconSO,
  IconTable,
  STATUS_LABEL,
  Spark,
  StatusIcon,
  TrendChart,
} from './ui'

type Props = {
  aksi: AksiRow[]
  targets: TargetRow[]
  realisasi: RealRow[]
  hariIni: string
  bulanAwal: number
  sinkron: string | null
}

type BarisTampil = { a: AksiRow; h: Hitung }

const SEMUA = 'ALL'

// 6 card di atas. Nilainya dari sheet KPI di Excel (Kode KPI-01 sampai KPI-06).
const KARTU = [
  { kode: 'KPI-01', label: 'Revenue', Ikon: IconRevenue },
  { kode: 'KPI-02', label: 'SO', Ikon: IconSO },
  { kode: 'KPI-03', label: 'RE', Ikon: IconRE },
  { kode: 'KPI-04', label: 'PS', Ikon: IconPS },
  { kode: 'KPI-05', label: 'Payload', Ikon: IconPayload },
  { kode: 'KPI-06', label: 'Active LIS', Ikon: IconLIS },
]

function Angka({ v, dec }: { v: number | null; dec?: number }) {
  return <>{fmt(v, dec)}</>
}

// Target: angka lalu satuan langsung di belakangnya, mis. "5.370 SO" atau "90%"
function TargetSatuan({ v, satuan }: { v: number | null; satuan: string | null }) {
  if (v === null) return <>–</>
  const u = !satuan ? '' : satuan === '%' ? '%' : ` ${satuan}`
  return (
    <>
      {fmt(v)}
      <span className="tunit">{u}</span>
    </>
  )
}

function pctTeks(v: number | null): string {
  return v === null ? '–' : `${Math.round(v)}%`
}

export default function Dashboard({ aksi, targets, realisasi, hariIni, bulanAwal, sinkron }: Props) {
  const [cluster, setCluster] = useState<string>(SEMUA)
  const [kIdx, setKIdx] = useState(0)
  const [bIdx, setBIdx] = useState(bulanAwal)
  const [kpiPilih, setKpiPilih] = useState<string | null>(null)
  // tampilan tabel/kartu: null = otomatis menurut lebar layar, atau pilihan pengguna
  const [tampilan, setTampilan] = useState<'tabel' | 'kartu' | null>(null)

  const tMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const t of targets) m.set(`${t.cluster}|${t.kode}|${t.periode}`, t.target)
    return m
  }, [targets])

  const rMap = useMemo(() => {
    const m = new Map<string, number>()
    for (const r of realisasi) m.set(`${r.cluster}|${r.kode}|${r.periode}|${r.minggu}`, r.nilai)
    return m
  }, [realisasi])

  const bulan = BULAN[bIdx]
  const periode = periodeStr(bulan.bulan)
  const minggu = useMemo(() => rentangMinggu(TAHUN, bulan.bulan), [bulan.bulan])
  const { jalan, total: totalHari } = hariBerjalan(hariIni, TAHUN, bulan.bulan)
  const paceHariIni = totalHari > 0 ? Math.round((jalan / totalHari) * 100) : 0

  // data sesuai filter cluster; KPI (card) dipisah dari action (tabel)
  const scope = useMemo(() => aksi.filter((a) => cluster === SEMUA || a.cluster === cluster), [aksi, cluster])
  const kpi = useMemo(() => scope.filter((a) => a.kode.startsWith('KPI-')), [scope])
  const biasa = useMemo(() => scope.filter((a) => !a.kode.startsWith('KPI-')), [scope])

  const komitmen = useMemo(() => {
    const peta = new Map<string, AksiRow[]>()
    for (const a of biasa) {
      const daftar = peta.get(a.commitment)
      if (daftar) daftar.push(a)
      else peta.set(a.commitment, [a])
    }
    return Array.from(peta, ([nama, daftar]) => ({
      nama,
      daftar,
      jml: new Set(daftar.map((x) => x.kode)).size,
    }))
  }, [biasa])

  const kAman = Math.min(kIdx, Math.max(komitmen.length - 1, 0))
  const terpilih = komitmen[kAman]

  // Satu baris per action. Saat All Cluster, target dan actual semua cluster digabung
  // (dijumlahkan; metrik % dan pp dirata-rata). Saat satu cluster dipilih, hanya cluster itu.
  const bangunBaris = useCallback(
    (daftar: AksiRow[]): BarisTampil[] => {
      const peta = new Map<string, AksiRow[]>()
      for (const a of daftar) {
        const grup = peta.get(a.kode)
        if (grup) grup.push(a)
        else peta.set(a.kode, [a])
      }
      return Array.from(peta.values()).map((grup) => {
        const a = grup[0]
        const rata = a.satuan === '%' || a.satuan === 'pp'
        const target = gabung(grup.map((x) => tMap.get(`${x.cluster}|${x.kode}|${periode}`) ?? null), rata)
        const mingguan = minggu.map((_, i) =>
          gabung(grup.map((x) => rMap.get(`${x.cluster}|${x.kode}|${periode}|${i + 1}`) ?? null), rata)
        )
        return { a, h: hitungBaris(a.tipe, target, mingguan, jalan, totalHari) }
      })
    },
    [tMap, rMap, periode, minggu, jalan, totalHari]
  )

  // tabel: commitment yang dipilih. semua: seluruh action (untuk ringkasan keseluruhan)
  const rows: BarisTampil[] = useMemo(() => (terpilih ? bangunBaris(terpilih.daftar) : []), [terpilih, bangunBaris])
  const semua: BarisTampil[] = useMemo(() => bangunBaris(biasa), [biasa, bangunBaris])

  // card KPI: saat All Cluster, nilai tiap cluster dijumlahkan
  const kartu = useMemo(() => {
    return KARTU.map((k) => {
      const baris = kpi.filter((a) => a.kode === k.kode)
      if (baris.length === 0) return { ...k, tipe: 'Kumulatif' as Tipe, satuan: null as string | null, target: null as number | null, h: null as Hitung | null }
      const target = jumlahTerisi(baris.map((a) => tMap.get(`${a.cluster}|${a.kode}|${periode}`) ?? null))
      const mingguan = minggu.map((_, i) =>
        jumlahTerisi(baris.map((a) => rMap.get(`${a.cluster}|${a.kode}|${periode}|${i + 1}`) ?? null))
      )
      return { ...k, tipe: baris[0].tipe, satuan: baris[0].satuan, target, h: hitungBaris(baris[0].tipe, target, mingguan, jalan, totalHari) }
    })
  }, [kpi, tMap, rMap, periode, minggu, jalan, totalHari])

    // ---- turunan murni untuk tampilan (tidak mengubah logika hitung di atas) ----
  const grid = {
    gridTemplateColumns: `minmax(0, 1fr) 112px repeat(${minggu.length}, 54px) 72px 116px 130px 116px`,
  }
  const namaCluster = cluster === SEMUA ? 'All Cluster' : cluster

  // minggu yang sedang berjalan (hanya untuk bulan yang masih berjalan)
  const cw = jalan > 0 && jalan < totalHari ? minggu.findIndex((w) => jalan >= w.awal && jalan <= w.akhir) : -1

  // KPI yang ditampilkan di panel tren: pilihan pengguna, atau KPI pertama yang sudah punya data
  const kpiAktif =
    kartu.find((k) => k.kode === kpiPilih) ?? kartu.find((k) => k.h !== null && k.h.total !== null) ?? kartu[0]
  const ha = kpiAktif.h
  const statusAktif: Status = ha !== null && kpiAktif.target !== null ? ha.status : 'none'
  const gap = ha !== null && kpiAktif.target !== null && ha.total !== null ? kpiAktif.target - ha.total : null

  // ringkasan kondisi seluruh action + 3 action yang paling perlu perhatian
  const ringkasan = useMemo(() => {
    const n: Record<Status, number> = { on: 0, watch: 0, risk: 0, none: 0 }
    for (const r of semua) n[r.h.status] += 1
    const perhatian = semua
      .filter((r) => r.h.ach !== null && (r.h.status === 'risk' || r.h.status === 'watch'))
      .sort((x, y) => (x.h.ach as number) - (y.h.ach as number))
      .slice(0, 3)
    return { n, total: semua.length, perhatian }
  }, [semua])

  const URUT: Status[] = ['on', 'watch', 'risk', 'none']

  const keTabel = (commitment: string) => {
    const i = komitmen.findIndex((k) => k.nama === commitment)
    if (i >= 0) setKIdx(i)
    const el = document.getElementById('tabel')
    if (el) el.scrollIntoView({ block: 'start' })
  }

  return (
    <>
      <div className="bar">
        <div className="brand">
          <span className="logo" aria-hidden="true">
            <IconBars size={15} />
          </span>
          <b>KOPDES</b>
          <i>Dashboard</i>
        </div>
        <div className="sync">
          <span className={`dot${sinkron ? '' : ' off'}`} aria-hidden="true" />
          {sinkron ? `Data per ${sinkron}` : 'Belum ada sinkron'}
        </div>
      </div>

      <div className="wrap">
        <div className="head">
          <div>
            <h1>Action Plan Q4 2026</h1>
            <div className="sub">
              <span>
                {namaCluster} · actual per minggu vs target {bulan.nama}
              </span>
              {jalan > 0 && jalan < totalHari ? (
                <span className="tprog" title={`Hari ke-${jalan} dari ${totalHari}`}>
                  <i>
                    <b style={{ width: `${paceHariIni}%` }} />
                  </i>
                  Hari ke-{jalan} dari {totalHari} ({paceHariIni}%)
                </span>
              ) : null}
            </div>
          </div>
          <div className="filters">
            <div className="fl">
              <label className="fl-lbl" htmlFor="cluster">
                <IconPin size={14} />
                Cluster
              </label>
              <select
                id="cluster"
                className="sel sm"
                value={cluster}
                onChange={(e) => {
                  setCluster(e.target.value)
                  setKIdx(0)
                }}
              >
                <option value={SEMUA}>All Cluster</option>
                {CLUSTER.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="fl">
              <span className="fl-lbl">
                <IconCalendar size={14} />
                Periode
              </span>
              <div className="segbtn" role="group" aria-label="Pilih bulan">
                {BULAN.map((b, i) => (
                  <button key={b.kode} type="button" className={i === bIdx ? 'aktif' : ''} aria-pressed={i === bIdx} onClick={() => setBIdx(i)}>
                    {b.kode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cards">
          {kartu.map((k) => {
            const h = k.h
            const status: Status = h !== null && k.target !== null ? h.status : 'none'
            const label = h === null ? 'Belum ada data' : k.target === null ? 'Belum ada target' : STATUS_LABEL[h.status]
            const ada = h !== null && h.total !== null
            const Ikon = k.Ikon
            const aktif = k.kode === kpiAktif.kode
            return (
              <div
                className={`kpi${aktif ? ' terpilih' : ''}`}
                key={k.kode}
                role="button"
                tabIndex={0}
                aria-pressed={aktif}
                title="Klik untuk melihat tren"
                onClick={() => setKpiPilih(k.kode)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setKpiPilih(k.kode)
                  }
                }}
              >
                <div className="kpi-top">
                  <span className="kpi-ico">
                    <Ikon size={14} />
                  </span>
                  {k.label}
                  <Spark values={h === null ? minggu.map(() => null) : h.minggu} />
                </div>
                <div>
                  <div className="kpi-val">
                    {ada ? fmt(h.total) : '–'}
                    {ada && k.satuan ? <span className="vunit">{k.satuan}</span> : null}
                  </div>
                  <div className="kpi-tgt">{k.target === null ? 'Target –' : `Target ${fmt(k.target)}`}</div>
                </div>
                <div className={`track sm st-${status}`}>
                  <div className="isi" style={{ width: `${Math.min(h?.ach ?? 0, 100)}%` }} />
                  {h !== null && h.pace > 0 && h.ach !== null ? <div className="pace" style={{ left: `calc(${h.pace}% - 1px)` }} /> : null}
                </div>
                <div className={`kpi-foot st-${status}`}>
                  <Chip status={status}>{label}</Chip>
                  <b className="kpi-ach">{pctTeks(h?.ach ?? null)}</b>
                </div>
              </div>
            )
          })}
        </div>

        <div className="band">
          <section className="panel">
            <div className="ph">
              <div>
                <div className="pt">Tren mingguan · {kpiAktif.label}</div>
                <div className="ps">
                  {kpiAktif.tipe === 'Kumulatif' ? 'Actual kumulatif vs target pace' : 'Level per minggu vs target'} · klik kartu KPI untuk mengganti
                </div>
              </div>
              <div className="lgd">
                <span>
                  <i className="sw-bar" />
                  Actual
                </span>
                <span>
                  <i className="sw-line" />
                  Target
                </span>
              </div>
            </div>
            <div className="trend">
              <div className="tstats">
                <Donut pct={ha?.ach ?? null} status={statusAktif} />
                <dl className="tl">
                  <div>
                    <dt>Hari berjalan</dt>
                    <dd>
                      {jalan} / {totalHari}
                    </dd>
                  </div>
                  <div>
                    <dt>Gap ke target</dt>
                    <dd>
                      {gap === null ? '–' : gap > 0 ? `${fmt(gap)}${kpiAktif.satuan ? ` ${kpiAktif.satuan}` : ''}` : 'Tercapai'}
                    </dd>
                  </div>
                  <div className={`st-${statusRR(ha?.rrPct ?? null)}`}>
                    <dt>Proyeksi akhir bulan</dt>
                    <dd className="rr">
                      {ha === null || ha.rr === null ? '–' : fmt(ha.rr)}
                      {ha !== null && ha.rrPct !== null ? <small> {Math.round(ha.rrPct)}%</small> : null}
                    </dd>
                  </div>
                </dl>
              </div>
              <TrendChart
                minggu={minggu}
                values={ha === null ? minggu.map(() => null) : ha.minggu}
                tipe={kpiAktif.tipe}
                target={kpiAktif.target}
                jalan={jalan}
                totalHari={totalHari}
                label={kpiAktif.label}
              />
            </div>
          </section>

          <section className="panel">
            <div className="ph">
              <div>
                <div className="pt">Kondisi keseluruhan</div>
                <div className="ps">{ringkasan.total} action · semua commitment</div>
              </div>
            </div>
            <div className="side">
              {ringkasan.total > 0 ? (
                <>
                  <div className="dist wide" aria-hidden="true">
                    {URUT.map((st) =>
                      ringkasan.n[st] > 0 ? (
                        <span key={st} className={`st-${st}`} style={{ width: `${(ringkasan.n[st] / ringkasan.total) * 100}%` }} />
                      ) : null
                    )}
                  </div>
                  <div className="stgrid">
                    {URUT.map((st) => (
                      <div className="sg" key={st}>
                        <StatusIcon status={st} size={14} />
                        <span>{STATUS_LABEL[st]}</span>
                        <b>{ringkasan.n[st]}</b>
                      </div>
                    ))}
                  </div>
                  <div className="pt2">Perlu perhatian</div>
                  {ringkasan.perhatian.length === 0 ? (
                    <div className="aman">
                      <StatusIcon status="on" size={14} />
                      Tidak ada action yang perlu perhatian
                    </div>
                  ) : (
                    <ul className="att">
                      {ringkasan.perhatian.map(({ a, h }) => (
                        <li key={a.kode}>
                          <button type="button" className={`att-b st-${h.status}`} onClick={() => keTabel(a.commitment)} title={`${a.commitment}: ${a.action}`}>
                            <span className="att-n">{a.action}</span>
                            <b>{pctTeks(h.ach)}</b>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div className="aman">Belum ada action untuk {namaCluster}.</div>
              )}
            </div>
          </section>
        </div>

        <div className={`panel v-${tampilan ?? 'auto'}`} id="tabel">
          <div className="toolbar">
            <div className="pilih">
              <label htmlFor="komitmen" className="fl-lbl">
                <IconList size={14} />
                Commitment
              </label>
              <select
                id="komitmen"
                className="sel"
                disabled={komitmen.length === 0}
                value={String(kAman)}
                onChange={(e) => setKIdx(Number(e.target.value))}
              >
                {komitmen.map((k, i) => (
                  <option key={k.nama} value={String(i)}>
                    {`${i + 1}. ${k.nama} (${k.jml} action)`}
                  </option>
                ))}
              </select>
            </div>
            {komitmen.length > 0 ? (
              <div className="vtoggle segbtn" role="group" aria-label="Pilih tampilan">
                <button
                  type="button"
                  className={`vt vt-tabel${tampilan === 'tabel' ? ' on' : ''}`}
                  aria-pressed={tampilan === 'tabel'}
                  aria-label="Tampilan tabel"
                  title="Tampilan tabel"
                  onClick={() => setTampilan('tabel')}
                >
                  <IconTable size={16} />
                </button>
                <button
                  type="button"
                  className={`vt vt-kartu${tampilan === 'kartu' ? ' on' : ''}`}
                  aria-pressed={tampilan === 'kartu'}
                  aria-label="Tampilan kartu"
                  title="Tampilan kartu"
                  onClick={() => setTampilan('kartu')}
                >
                  <IconGrid size={16} />
                </button>
              </div>
            ) : null}
          </div>

          {komitmen.length === 0 ? (
            <div className="kosong">
              <IconInbox size={22} />
              Belum ada action untuk {namaCluster}.
            </div>
          ) : (
            <>
              {/* Tampilan lebar: tabel */}
              <div className="desk">
                <div className="tinner" style={{ minWidth: 32 + 546 + 54 * minggu.length + 10 * (minggu.length + 5) + 220 }}>
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
                      <div className={`num${i === cw ? ' cwh' : ''}`} key={i}>
                        W{i + 1}
                        <div className="tgl">{w.awal === w.akhir ? w.awal : `${w.awal}–${w.akhir}`}</div>
                      </div>
                    ))}
                    <div className="num">Total</div>
                    <div className="num">RR</div>
                    <div className="num">ACH</div>
                    <div className="num">Status</div>
                  </div>
                </div>

                {rows.map(({ a, h }) => (
                  <div className="row" style={grid} key={a.kode}>
                    <div className="nama">
                      <span className="nm" title={a.action}>
                        {a.action}
                      </span>
                    </div>
                    <div className="num tgt">
                      <TargetSatuan v={h.target} satuan={a.satuan} />
                    </div>
                    {h.minggu.map((v, i) => (
                      <div className={`num w${i === cw ? ' cw' : ''}${v === null ? ' na' : ''}`} key={i}>
                        <Angka v={v} />
                      </div>
                    ))}
                    <div className={`num tot${h.total === null ? ' na' : ''}`}>
                      <Angka v={h.total} />
                    </div>
                    <div className={`num rr st-${statusRR(h.rrPct)}${h.rr === null ? ' na' : ''}`}>
                      <span className="tot">
                        <Angka v={h.rr} />
                      </span>{' '}
                      <span className="kecil">{h.rrPct === null ? '' : `${Math.round(h.rrPct)}%`}</span>
                    </div>
                    <div className={`ach st-${h.status}`}>
                      <div className="track">
                        <div className="isi" style={{ width: `${Math.min(h.ach ?? 0, 100)}%` }} />
                        {h.pace > 0 && h.ach !== null ? <div className="pace" style={{ left: `calc(${h.pace}% - 1px)` }} /> : null}
                      </div>
                      <span className="pct">{pctTeks(h.ach)}</span>
                    </div>
                    <div className="num">
                      <Chip status={h.status}>{STATUS_LABEL[h.status]}</Chip>
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {/* Tampilan sempit: daftar kartu */}
              <div className="mob">
                {rows.map(({ a, h }) => (
                  <div className={`item st-${h.status}`} key={a.kode}>
                    <div className="itop">
                      <span className="nm2">{a.action}</span>
                      <Chip status={h.status}>{STATUS_LABEL[h.status]}</Chip>
                    </div>
                    <div className="ach">
                      <div className="track">
                        <div className="isi" style={{ width: `${Math.min(h.ach ?? 0, 100)}%` }} />
                        {h.pace > 0 && h.ach !== null ? <div className="pace" style={{ left: `calc(${h.pace}% - 1px)` }} /> : null}
                      </div>
                      <span className="pct">{pctTeks(h.ach)}</span>
                    </div>
                    <div className="wk" style={{ gridTemplateColumns: `repeat(${minggu.length}, minmax(0, 1fr))` }}>
                      {h.minggu.map((v, i) => (
                        <div key={i} className={`${i === cw ? 'cw ' : ''}${v === null ? 'na' : ''}`}>
                          <div className="lbl2">W{i + 1}</div>
                          <div>
                            <Angka v={v} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="stat3">
                      <div>
                        <div className="lbl2">Target</div>
                        <div className="mid">
                          <TargetSatuan v={h.target} satuan={a.satuan} />
                        </div>
                      </div>
                      <div>
                        <div className="lbl2">Total</div>
                        <div className={`tot${h.total === null ? ' na' : ''}`}>
                          <Angka v={h.total} />
                        </div>
                      </div>
                      <div className={`rr st-${statusRR(h.rrPct)}${h.rr === null ? ' na' : ''}`}>
                        <div className="lbl2">RR</div>
                        <div>
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
                <span className="lg-i">
                  <StatusIcon status="on" size={14} />
                  On Track: ACH sudah di atas posisi hari ini
                </span>
                <span className="lg-i">
                  <StatusIcon status="watch" size={14} />
                  Watch: 90–99% dari posisi
                </span>
                <span className="lg-i">
                  <StatusIcon status="risk" size={14} />
                  At Risk: di bawah 90%
                </span>
                {paceHariIni > 0 ? (
                  <span className="lg-i">
                    <i className="pace-lg" />
                    Posisi seharusnya hari ini ({paceHariIni}%)
                  </span>
                ) : null}
                <span className="lg-n">
                  W = minggu Senin–Minggu (tanggal {bulan.nama}). “–” = belum diisi, “0” = sudah dicek nol. RR = proyeksi akhir bulan
                  {jalan > 0 ? ` (Total ÷ ${jalan} hari × ${totalHari} hari)` : ''}, % = RR ÷ target. ACH = Total ÷ target. Metrik level (outlet, %, Active LIS): Total = minggu terakhir, RR tidak dihitung.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
