import { useEffect, useId, useMemo, useState, useSyncExternalStore } from 'react'
import { ArrowRightIcon, BenchIcon, ChevronDownIcon, ChevronRightIcon, TargetIcon, TrophyIcon } from '../components/Icons'
import { myCharacter } from '../data/character'
import { insight } from '../data/insights'
import {
  groupName,
  periodDays,
  progressReport,
  recordCategories,
  recordsFor,
  type GroupId,
  type Period,
  type PersonalRecord,
  type ProgressReport,
  type RecordCategory,
} from '../data/progress'
import { getWorkouts, subscribeWorkouts } from '../data/workouts'

// Раздел «Прогресс»: все числа — из истории тренировок (src/data/workouts.ts), расчёт — src/data/progress.ts.

const useWorkouts = () => useSyncExternalStore(subscribeWorkouts, getWorkouts, getWorkouts)

const pct = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.round(Math.abs(x) * 100)}%`
const kg = (x: number) => `${Number.isInteger(x) ? x : x.toFixed(1).replace('.', ',')} кг`
const dateRu = (t: number | string) =>
  new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')

const periods: { id: Period; name: string }[] = [
  { id: 'week', name: 'Неделя' },
  { id: 'month', name: 'Месяц' },
]

export function Progress({ onOpenGroup }: { onOpenGroup: (group?: GroupId) => void }) {
  const workouts = useWorkouts()
  const [period, setPeriod] = useState<Period>('month')
  const report = useMemo(() => progressReport(workouts, period), [workouts, period])
  const tip = insight(report, workouts.length)

  return (
    <main className="pg">
      <header className="pg__head">
        <h1 className="pg__title">Прогресс</h1>
        {workouts.length > 0 && (
          <div className="ex__seg pg__seg" role="tablist" aria-label="Период">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={period === p.id}
                className={`ex__seg-btn tappable${period === p.id ? ' is-on' : ''}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </header>
      <BodyMap report={report} />
      <div className="pg__body">
        {workouts.length === 0 ? (
          // ни одной тренировки: одна понятная карточка вместо трёх «Недостаточно данных»
          <section className="card pg-start" aria-label="Нет тренировок">
            <h2 className="pg-start__title">Прогресс появится после первых тренировок</h2>
            <p className="pg-start__text">
              Записывайте вес и повторения — здесь появятся рост силы, личные рекорды и подсказки, что подтянуть.
            </p>
            <button type="button" className="cta tappable pg-start__cta" onClick={() => onOpenGroup()}>
              Перейти к упражнениям
              <ArrowRightIcon />
            </button>
          </section>
        ) : (
          <>
            <StrengthCard report={report} />
            <RecordsCard />
            <button
              type="button"
              className="card pg-tip tappable"
              disabled={!tip.group}
              onClick={() => onOpenGroup(tip.group)}
              aria-label={`Что улучшить: ${tip.text}`}
            >
              <span className="icon-disc pg-tip__icon">
                <TargetIcon />
              </span>
              <span className="pg-tip__text">
                <span className="pg-tip__title">Что улучшить</span>
                <span className="pg-tip__body">{tip.text}</span>
                {tip.group && <span className="pg-tip__link">Упражнения: {groupName[tip.group].toLowerCase()}</span>}
              </span>
              {tip.group && <ChevronRightIcon className="pg-tip__go" />}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

/* ── персонаж с процентами по группам ── */

const order: GroupId[] = ['chest', 'back', 'shoulders', 'legs', 'arms', 'abs']
const LX = { l: 178, r: 640 }
const MAX_MARKS = 3

function BodyMap({ report }: { report: ProgressReport }) {
  const hero = myCharacter()
  // фиксированный порядок групп: падение показываем так же, как рост, ничего не прячем
  const shown = order
    .map((id) => report.groups.find((g) => g.group === id))
    .filter((g) => !!g)
    .slice(0, MAX_MARKS)
  const insufficient = report.sessions > 0 && !shown.length
  return (
    <section className="pg-hero" aria-label="Прогресс по группам мышц">
      <img className="pg-hero__art" src={hero.src} alt="" width={hero.w} height={hero.h} draggable={false} />
      <svg className="pg-hero__lines" viewBox={`0 0 ${hero.w} ${hero.h}`} aria-hidden>
        {shown.map(({ group }) => {
          const a = hero.anchors[group as keyof typeof hero.anchors]
          const x0 = LX[a.side]
          return (
            <g key={group}>
              <polyline points={`${x0},${a.ly} ${a.side === 'l' ? x0 + 40 : x0 - 40},${a.ly} ${a.x},${a.y}`} />
              <circle cx={a.x} cy={a.y} r="7" />
            </g>
          )
        })}
      </svg>
      {shown.map(({ group, change }) => {
        const a = hero.anchors[group as keyof typeof hero.anchors]
        const style =
          a.side === 'l'
            ? { right: `${(1 - LX.l / hero.w) * 100}%`, top: `${(a.ly / hero.h) * 100}%` }
            : { left: `${(LX.r / hero.w) * 100}%`, top: `${(a.ly / hero.h) * 100}%` }
        return (
          <div key={group} className={`pg-mark pg-mark--${a.side}${change < 0 ? ' is-down' : ''}`} style={style}>
            <span className="pg-mark__name">{groupName[group]}</span>
            <span className="pg-mark__val">{pct(change)}</span>
          </div>
        )
      })}
      {insufficient && (
        <p className="pg-hero__empty">
          Недостаточно данных
          <span>Проценты по мышцам появятся, когда упражнение повторится хотя бы дважды</span>
        </p>
      )}
    </section>
  )
}

/* ── рост силы ── */

function StrengthCard({ report }: { report: ProgressReport }) {
  const days = periodDays[report.period]
  const has = report.chart.length >= 2
  const delta = has ? report.chart[report.chart.length - 1].value / 100 - 1 : 0
  return (
    <section className="card pg-str" aria-label="Рост силы">
      <h2 className="pg-str__title">Рост силы</h2>
      <p className="pg-str__sub">
        {has ? `${pct(delta)} за ${days === 7 ? '7 дней' : `${days} дней`}` : 'Недостаточно данных'}
      </p>
      {has ? (
        <Chart report={report} />
      ) : (
        <p className="pg-str__empty">
          График строится по рабочим весам и повторениям. Нужны хотя бы две тренировки с одинаковыми упражнениями за этот период.
        </p>
      )}
    </section>
  )
}

const W = 320
const H = 132
const PAD = { l: 36, r: 10, t: 22, b: 22 }

function Chart({ report }: { report: ProgressReport }) {
  const gid = useId()
  const pts = report.chart
  const vals = pts.map((p) => p.value)
  let lo = Math.floor(Math.min(100, ...vals) / 4) * 4
  let hi = Math.ceil(Math.max(100, ...vals) / 4) * 4
  if (hi - lo < 8) hi = lo + 8
  const step = (hi - lo) / 3
  lo = Math.round(lo)
  const x = (t: number) => PAD.l + ((t - report.from) / (report.to - report.from)) * (W - PAD.l - PAD.r)
  const y = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.value).toFixed(1)}`).join('')
  const area = `${line}L${x(pts[pts.length - 1].t).toFixed(1)},${H - PAD.b}L${x(pts[0].t).toFixed(1)},${H - PAD.b}Z`
  const last = pts[pts.length - 1]
  const ticksX = [0, 0.25, 0.5, 0.75, 1].map((k) => report.from + k * (report.to - report.from))
  const delta = last.value - 100
  const bx = Math.min(Math.max(x(last.t), PAD.l + 22), W - 24)
  return (
    <svg className="pg-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Индекс силы: ${Math.round(last.value)}%`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8cc4fb" stopOpacity="0.32" />
          <stop offset="1" stopColor="#8cc4fb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => {
        const v = lo + i * step
        return (
          <g key={i}>
            <line className="pg-chart__grid" x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} />
            <text className="pg-chart__y" x={PAD.l - 6} y={y(v) + 3}>
              {Math.round(v)}%
            </text>
          </g>
        )
      })}
      {ticksX.map((t, i) => (
        <text key={i} className="pg-chart__x" x={x(t)} y={H - 6} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>
          {dateRu(t)}
        </text>
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path className="pg-chart__line" d={line} />
      <circle className="pg-chart__dot" cx={x(last.t)} cy={y(last.value)} r="3.2" />
      <g transform={`translate(${bx},${Math.max(y(last.value) - 14, 9)})`}>
        <rect className="pg-chart__badge" x="-20" y="-9" width="40" height="16" rx="5" />
        <text className="pg-chart__badge-t" y="3" textAnchor="middle">
          {pct(delta / 100)}
        </text>
      </g>
    </svg>
  )
}

/* ── личные рекорды ── */

type CatRecords = { cat: RecordCategory; records: PersonalRecord[]; best: PersonalRecord | null }

function RecordsCard() {
  const workouts = useWorkouts()
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<CatRecords | null>(null)
  const panelId = useId()
  const cats: CatRecords[] = useMemo(
    () =>
      recordCategories.map((cat) => {
        const records = recordsFor(workouts, cat)
        const best = records.reduce<PersonalRecord | null>((m, r) => (!m || r.e1rm > m.e1rm ? r : m), null)
        return { cat, records, best }
      }),
    [workouts],
  )
  const top = cats.find((c) => c.cat.id === 'bench' && c.best) ?? cats.find((c) => c.best) ?? null

  return (
    <section className={`card pg-rec${open ? ' is-open' : ''}`} aria-label="Личные рекорды">
      <button type="button" className="pg-rec__head tappable" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((v) => !v)}>
        <TrophyIcon className="pg-rec__cup" />
        <span className="pg-rec__text">
          <span className="pg-rec__title">Личные рекорды</span>
          <span className="pg-rec__sub">
            {top ? 'Ваши лучшие результаты' : 'Появятся после тренировок с рабочим весом'}
          </span>
        </span>
        <ChevronDownIcon className="pg-rec__chev" />
      </button>
      <div className="pg-rec__fold pg-rec__fold--top" aria-hidden={open}>
        <div className="pg-rec__inner">
          {top ? (
            <button type="button" className="pg-rec__best tappable" tabIndex={open ? -1 : 0} onClick={() => setDetail(top)}>
              <BenchIcon />
              <span className="pg-rec__cat">
                <span className="pg-rec__best-name">{top.cat.name}</span>
                <span className="pg-rec__ex">
                  {top.best!.name} • {top.best!.reps} повт.
                </span>
              </span>
              <span className="pg-rec__best-val">{kg(top.best!.weight)}</span>
            </button>
          ) : (
            <p className="pg-rec__none">Недостаточно данных</p>
          )}
        </div>
      </div>
      <div className="pg-rec__fold pg-rec__fold--list" id={panelId}>
        <ul className="pg-rec__inner pg-rec__list">
          {cats.map((c, i) => (
            <li key={c.cat.id}>
              <button
                type="button"
                className="pg-rec__row tappable"
                disabled={!c.best}
                tabIndex={open ? 0 : -1}
                onClick={() => setDetail(c)}
              >
                <span className="pg-rec__num">{i + 1}</span>
                <span className="pg-rec__cat">
                  <span className="pg-rec__name">{c.cat.name}</span>
                  {c.best && (
                    <span className="pg-rec__ex">
                      {c.best.name} • {c.best.reps} повт.
                    </span>
                  )}
                </span>
                <span className="pg-rec__val">{c.best ? kg(c.best.weight) : 'Нет данных'}</span>
                {c.best && <ChevronRightIcon className="pg-rec__go" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {detail && <RecordSheet data={detail} onClose={() => setDetail(null)} />}
    </section>
  )
}

function RecordSheet({ data, onClose }: { data: CatRecords; onClose: () => void }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(r)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])
  return (
    <div className={`pg-sheet${shown ? ' is-on' : ''}`} role="dialog" aria-modal="true" aria-label={data.cat.name}>
      <button type="button" className="pg-sheet__scrim" aria-label="Закрыть" onClick={onClose} />
      <div className="pg-sheet__panel">
        <div className="pg-sheet__grip" />
        <h2 className="pg-sheet__title">{data.cat.name}</h2>
        <p className="pg-sheet__sub">Рекорд по каждому упражнению — по оценочному максимуму на 1 повторение</p>
        <ul className="pg-sheet__list">
          {data.records.map((r) => (
            <li key={r.exerciseId} className="card pg-pr">
              <span className="pg-pr__name">{r.name}</span>
              <span className="pg-pr__main">
                <span className="pg-pr__w">
                  {kg(r.weight)} × {r.reps}
                </span>
                <span className="pg-pr__date">{dateRu(r.date)}</span>
              </span>
              <span className="pg-pr__meta">Максимум ≈ {kg(Math.round(r.e1rm * 2) / 2)} на 1 повтор</span>
              <span className="pg-pr__meta">
                {r.previous ? (
                  <>
                    Предыдущий: {kg(r.previous.weight)} × {r.previous.reps}, {dateRu(r.previous.date)}
                    <b className={r.change! < 0 ? 'is-down' : ''}> {pct(r.change!)}</b>
                  </>
                ) : (
                  'Первый результат — сравнивать пока не с чем'
                )}
              </span>
            </li>
          ))}
        </ul>
        <button type="button" className="pg-sheet__close tappable" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  )
}
