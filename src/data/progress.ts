// Расчёт прогресса — детерминированно, только по истории тренировок (src/data/workouts.ts).
// Никаких выдуманных чисел: если сравнивать не с чем, возвращаем null → в UI «Недостаточно данных».
//
// Методика:
// • Сила в подходе с весом — оценочный 1ПМ по Эпли: вес × (1 + повторения / 30). Подходы > 12 повторений
//   для 1ПМ не берём (формула там врёт). Упражнения без веса сравниваем по лучшему числу повторений.
// • Сравниваем только одно и то же упражнение (один exerciseId) с самим собой. Разные упражнения
//   и разное оборудование напрямую не сравниваются.
// • Изменение упражнения за период: лучший результат в текущем окне против лучшего в предыдущем окне
//   той же длины. Если в предыдущем окне упражнения не было, но в текущем было ≥ 2 тренировок —
//   против первой тренировки окна.
// • Группа мышц и общий «Рост силы» — медиана изменений упражнений (устойчива к одному выбросу).

import type { ExerciseLog, SetLog, Workout } from './workouts'

export type Period = 'week' | 'month'
export const periodDays: Record<Period, number> = { week: 7, month: 30 }

const DAY = 86_400_000
const MAX_E1RM_REPS = 12

export type GroupId = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'abs' | 'cardio'
export const groupName: Record<GroupId, string> = {
  chest: 'Грудь',
  back: 'Спина',
  shoulders: 'Плечи',
  arms: 'Руки',
  legs: 'Ноги',
  abs: 'Пресс',
  cardio: 'Кардио',
}
const partToGroup: Record<string, GroupId> = {
  chest: 'chest',
  back: 'back',
  neck: 'back',
  shoulders: 'shoulders',
  'upper arms': 'arms',
  'lower arms': 'arms',
  'upper legs': 'legs',
  'lower legs': 'legs',
  waist: 'abs',
  cardio: 'cardio',
}
export const groupOf = (bodyPart: string): GroupId | null => partToGroup[bodyPart] ?? null

/** Оценочный 1ПМ подхода; null — подход не годится для оценки. */
export const e1rm = (s: SetLog) =>
  s.weight > 0 && s.reps >= 1 && s.reps <= MAX_E1RM_REPS ? (s.reps === 1 ? s.weight : s.weight * (1 + s.reps / 30)) : null

type Kind = 'e1rm' | 'reps'
/** Показатель упражнения в одной тренировке: лучший 1ПМ, а без веса — лучшее число повторений. */
const score = (e: ExerciseLog, kind: Kind) => {
  let best: number | null = null
  for (const s of e.sets) {
    const v = kind === 'e1rm' ? e1rm(s) : s.weight === 0 && s.reps > 0 ? s.reps : null
    if (v !== null && (best === null || v > best)) best = v
  }
  return best
}

type Session = { t: number; v: number }
type Series = { id: string; name: string; group: GroupId | null; kind: Kind; sessions: Session[] }

/** Ряды по упражнениям: одна точка на тренировку. Вид показателя — по всей истории упражнения. */
function seriesOf(workouts: Workout[]): Series[] {
  const byId = new Map<string, { log: ExerciseLog; t: number }[]>()
  for (const w of workouts) {
    const t = Date.parse(w.date)
    for (const e of w.exercises) {
      const arr = byId.get(e.exerciseId) ?? []
      arr.push({ log: e, t })
      byId.set(e.exerciseId, arr)
    }
  }
  const out: Series[] = []
  for (const [id, items] of byId) {
    const loaded = items.some(({ log }) => log.sets.some((s) => e1rm(s) !== null))
    const kind: Kind = loaded ? 'e1rm' : 'reps'
    const sessions: Session[] = []
    for (const { log, t } of items) {
      const v = score(log, kind)
      if (v !== null) sessions.push({ t, v })
    }
    if (!sessions.length) continue
    const last = items[items.length - 1].log
    out.push({ id, name: last.name, group: groupOf(last.bodyPart), kind, sessions })
  }
  return out
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
const max = (xs: Session[]) => xs.reduce((m, x) => Math.max(m, x.v), -Infinity)

export type ExerciseChange = { id: string; name: string; group: GroupId | null; change: number }
export type GroupChange = { group: GroupId; change: number; exercises: number }
export type ChartPoint = { t: number; value: number }

export type ProgressReport = {
  period: Period
  /** Тренировок в текущем окне. */
  sessions: number
  /** Общий рост силы, доля (0.12 = +12%); null — недостаточно данных. */
  overall: number | null
  groups: GroupChange[]
  exercises: ExerciseChange[]
  /** Индекс силы по дням (100 = первая тренировка периода); пусто — недостаточно данных. */
  chart: ChartPoint[]
  from: number
  to: number
}

export function progressReport(workouts: Workout[], period: Period, now = Date.now()): ProgressReport {
  const L = periodDays[period] * DAY
  const from = now - L
  const inCur = (t: number) => t > from && t <= now
  const inPrev = (t: number) => t > from - L && t <= from
  const series = seriesOf(workouts)

  const exercises: ExerciseChange[] = []
  for (const s of series) {
    const cur = s.sessions.filter((x) => inCur(x.t))
    if (!cur.length) continue
    const prev = s.sessions.filter((x) => inPrev(x.t))
    let base: number | null = null
    let rest = cur
    if (prev.length) base = max(prev)
    else if (cur.length >= 2) {
      base = cur[0].v
      rest = cur.slice(1)
    }
    if (base === null || base <= 0) continue
    exercises.push({ id: s.id, name: s.name, group: s.group, change: max(rest) / base - 1 })
  }

  const byGroup = new Map<GroupId, number[]>()
  for (const e of exercises) {
    if (!e.group) continue
    byGroup.set(e.group, [...(byGroup.get(e.group) ?? []), e.change])
  }
  const groups = [...byGroup].map(([group, xs]) => ({ group, change: median(xs), exercises: xs.length }))
  groups.sort((a, b) => b.change - a.change)

  // график «Рост силы»: от первой тренировки периода. По каждой дате тренировки — медиана
  // (лучшее к этой дате / первый результат периода) по упражнениям, сделанным в периоде ≥ 2 раз.
  const days = [...new Set(workouts.map((w) => Date.parse(w.date)).filter(inCur))].sort((a, b) => a - b)
  const repeated = series.map((s) => s.sessions.filter((x) => inCur(x.t))).filter((cur) => cur.length >= 2)
  const chart: ChartPoint[] = []
  for (const t of days) {
    const ratios: number[] = []
    for (const cur of repeated) {
      const upTo = cur.filter((x) => x.t <= t)
      if (upTo.length) ratios.push(max(upTo) / cur[0].v)
    }
    if (ratios.length) chart.push({ t, value: median(ratios) * 100 })
  }

  return {
    period,
    sessions: days.length,
    overall: exercises.length ? median(exercises.map((e) => e.change)) : null,
    groups,
    exercises,
    chart: chart.length >= 2 ? chart : [],
    from,
    to: now,
  }
}

/* ── Личные рекорды ── */

export type RecordCategory = { id: string; name: string; match: (e: ExerciseLog) => boolean }

// Списки — упражнения Vital одного типа. Внутри категории каждое упражнение ведёт свой рекорд:
// жим штанги и жим гантелей не смешиваются.
const ids = (...xs: string[]) => new Set(xs)
const BENCH = ids('0042', '0046', '0227', '1442', '1522', '0141', '1720')
const PULLDOWN = ids('0037', '1303', '1386', '1713', '1277', '1329', '1739', '0201', '1255')
const DEADLIFT = ids('0032', '0033', '0191', '0249', '1259', '1477', '1571', '1705', '1708')

export const recordCategories: RecordCategory[] = [
  { id: 'bench', name: 'Жим лёжа', match: (e) => BENCH.has(e.exerciseId) },
  { id: 'biceps', name: 'Бицепс', match: (e) => e.target === 'biceps' },
  { id: 'pulldown', name: 'Тяга блока', match: (e) => PULLDOWN.has(e.exerciseId) },
  { id: 'deadlift', name: 'Становая тяга', match: (e) => DEADLIFT.has(e.exerciseId) },
  // «Ноги / Грудь / Спина» — остальные упражнения группы: жим лёжа, тяга блока и становая уже в своих строках
  { id: 'legs', name: 'Ноги', match: (e) => groupOf(e.bodyPart) === 'legs' && !DEADLIFT.has(e.exerciseId) },
  { id: 'chest', name: 'Грудь', match: (e) => groupOf(e.bodyPart) === 'chest' && !BENCH.has(e.exerciseId) },
  { id: 'back', name: 'Спина', match: (e) => groupOf(e.bodyPart) === 'back' && !PULLDOWN.has(e.exerciseId) && !DEADLIFT.has(e.exerciseId) },
]

export type PersonalRecord = {
  exerciseId: string
  name: string
  weight: number
  reps: number
  e1rm: number
  date: string
  previous: { weight: number; reps: number; e1rm: number; date: string } | null
  /** Изменение 1ПМ относительно предыдущего рекорда, доля. */
  change: number | null
}

/** Рекорд каждого упражнения категории (по оценочному 1ПМ), сортировка — самые свежие сверху. */
export function recordsFor(workouts: Workout[], cat: RecordCategory): PersonalRecord[] {
  const byId = new Map<string, { name: string; sets: { s: SetLog; v: number; date: string; t: number }[] }>()
  for (const w of workouts) {
    const t = Date.parse(w.date)
    for (const e of w.exercises) {
      if (!cat.match(e)) continue
      const entry = byId.get(e.exerciseId) ?? { name: e.name, sets: [] }
      entry.name = e.name
      for (const s of e.sets) {
        const v = e1rm(s)
        if (v !== null) entry.sets.push({ s, v, date: w.date, t })
      }
      byId.set(e.exerciseId, entry)
    }
  }
  const out: PersonalRecord[] = []
  for (const [exerciseId, { name, sets }] of byId) {
    if (!sets.length) continue
    const best = sets.reduce((a, b) => (b.v > a.v ? b : a))
    const before = sets.filter((x) => x.t < best.t)
    const prev = before.length ? before.reduce((a, b) => (b.v > a.v ? b : a)) : null
    out.push({
      exerciseId,
      name,
      weight: best.s.weight,
      reps: best.s.reps,
      e1rm: best.v,
      date: best.date,
      previous: prev && { weight: prev.s.weight, reps: prev.s.reps, e1rm: prev.v, date: prev.date },
      change: prev ? best.v / prev.v - 1 : null,
    })
  }
  out.sort((a, b) => b.date.localeCompare(a.date))
  return out
}
