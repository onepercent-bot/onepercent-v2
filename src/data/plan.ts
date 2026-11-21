// План тренировок по анкете — блоками по 4 недели, детерминированно (без AI).
// Состав тренировки: число упражнений по времени и уровню, из них ~60 % базовых; базовые всегда идут первыми,
// изолирующие — добивка. Вес: первая тренировка — «подбор» на нижний край диапазона, дальше по истории:
// все подходы на верх диапазона → прибавка, иначе тот же вес и добор повторов. 4-я неделя блока — облегчённая.
import { isBackupModel, myExercises, placesOf, type Exercise } from './exercises'
import { getWorkouts, type ExerciseLog, type Workout } from './workouts'
import type { Level, Profile } from '../onboarding'

/* ── состав тренировки ── */

/** Сколько силовых упражнений в тренировке — по времени из анкеты и уровню. */
export function exercisesPerSession(minutes: number | null, level: Level | null): number {
  const byTime = minutes === null ? 5 : minutes <= 30 ? 3 : minutes <= 45 ? 4 : minutes <= 60 ? 5 : 6
  const adj = level === 'beginner' ? -1 : level === 'advanced' ? 1 : 0
  return Math.min(8, Math.max(3, byTime + adj))
}

/** Сколько из них базовых, сколько лёгких: 3 → 2 + 1, 4 → 2 + 2, 5 → 3 + 2, 6 → 4 + 2. */
export function sessionMix(count: number): { base: number; iso: number } {
  const base = Math.max(1, Math.round(count * 0.6))
  return { base, iso: count - base }
}

/* ── группы мышц для слотов ── */

// Становая и «гуд морнинг» — это ноги/ягодицы (наклон от таза), а не день спины с тягами.
const HINGE = /deadlift|good morning|hyperextension|back extension/i

type Slot = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'quads' | 'hips' | 'calves' | 'abs'

const inSlot: Record<Slot, (e: Exercise) => boolean> = {
  chest: (e) => e.bodyPart === 'chest' && e.target !== 'triceps',
  back: (e) => (e.bodyPart === 'back' || e.bodyPart === 'neck') && !HINGE.test(e.nameEn),
  shoulders: (e) => e.bodyPart === 'shoulders',
  biceps: (e) => e.target === 'biceps',
  triceps: (e) => e.target === 'triceps',
  quads: (e) => e.bodyPart === 'upper legs' && ['quads', 'upper legs', 'adductors', 'abductors'].includes(e.target),
  hips: (e) => (e.bodyPart === 'upper legs' && ['glutes', 'hamstrings'].includes(e.target)) || (e.bodyPart === 'back' && HINGE.test(e.nameEn)),
  calves: (e) => e.bodyPart === 'lower legs',
  abs: (e) => e.bodyPart === 'waist',
}

type Template = { title: string; base: Slot[]; iso: Slot[] }

const T: Record<string, Template> = {
  fullA: { title: 'Всё тело', base: ['quads', 'chest', 'back', 'hips'], iso: ['shoulders', 'abs', 'biceps', 'triceps'] },
  fullB: { title: 'Всё тело', base: ['hips', 'back', 'shoulders', 'quads'], iso: ['chest', 'abs', 'triceps', 'biceps'] },
  fullC: { title: 'Всё тело', base: ['quads', 'back', 'chest', 'hips'], iso: ['shoulders', 'abs', 'calves', 'biceps'] },
  upper: { title: 'Верх тела', base: ['chest', 'back', 'shoulders', 'back'], iso: ['biceps', 'triceps', 'shoulders', 'abs'] },
  lower: { title: 'Ноги и пресс', base: ['quads', 'hips', 'quads', 'hips'], iso: ['abs', 'hips', 'calves', 'quads'] },
  push: { title: 'Грудь и трицепс', base: ['chest', 'chest', 'shoulders', 'triceps'], iso: ['triceps', 'chest', 'shoulders', 'triceps'] },
  pull: { title: 'Спина и бицепс', base: ['back', 'back', 'back', 'back'], iso: ['biceps', 'back', 'biceps', 'abs'] },
  legs: { title: 'Ноги', base: ['quads', 'hips', 'quads', 'hips'], iso: ['hips', 'calves', 'quads', 'abs'] },
}

const split = (perWeek: number, level: Level | null): Template[] => {
  if (perWeek <= 2) return [T.fullA, T.fullB]
  if (perWeek === 3) return level === 'beginner' ? [T.fullA, T.fullB, T.fullC] : [T.push, T.pull, T.legs]
  if (perWeek === 4) return [T.upper, T.lower, T.upper, T.lower]
  if (perWeek === 5) return [T.push, T.pull, T.legs, T.upper, T.lower]
  return [T.push, T.pull, T.legs, T.push, T.pull, T.legs]
}

const defaultDays: Record<number, number[]> = { 1: [2], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] }

// Приоритетные мышцы из анкеты → слот, который ставим первой «добивкой».
const prioritySlot: Record<string, Slot> = {
  Грудь: 'chest', Спина: 'back', Плечи: 'shoulders', Руки: 'biceps', Пресс: 'abs', Ноги: 'quads', Ягодицы: 'hips',
}

/* ── где тренируется человек ── */

const MACHINE = new Set(['machine', 'cable', 'leverage machine', 'smith machine', 'assisted', 'sled', 'hex bar', 'trap bar'])
const tagOf: Record<string, string> = {
  dumbbell: 'Гантели', barbell: 'Штанга', kettlebell: 'Гиря', band: 'Резинки', 'resistance band': 'Резинки',
  pullup_bar: 'Турник', bench: 'Скамья', box: 'Скамья', dip_bars: 'Брусья', plate: 'Штанга', weight: 'Гантели', chair: '',
}
// В домашней коллекции Vital «скамья» и «тумба» — это диван, стул, ступенька.
const needsOf = (e: Exercise) =>
  [e.equipment, ...e.needs].filter((x) => x !== 'body weight' && !(e.collection === 'home' && (x === 'bench' || x === 'box')))

function available(e: Exercise, p: Profile): boolean {
  if (p.place === 'gym' || p.place === null) return placesOf(e).includes('gym') || placesOf(e).includes('home')
  if (p.place === 'home_bodyweight') return placesOf(e).includes('none')
  const owned = new Set(p.place === 'outdoor' ? ['Турник', 'Брусья'] : p.equipment)
  return needsOf(e).every((n) => !MACHINE.has(n) && n in tagOf && (tagOf[n] === '' || owned.has(tagOf[n])))
}

// Ограничения из анкеты: что не ставим в план.
const avoid: Record<string, RegExp> = {
  'Спина / поясница': /deadlift|good morning|bent over|pendlay|yates|back squat|hyperextension|superman|jefferson|zercher/i,
  Колени: /jump|hop|lunge|pistol|sissy|split squat|step.?up|skater|burpee/i,
  Плечи: /overhead|behind.?the.?neck|upright row|dip|handstand|arnold|military/i,
  Локти: /skull|french|overhead triceps|dip|close grip/i,
  Запястья: /knuckle|finger|wrist|clap|handstand/i,
  Шея: /neck|shrug|headstand/i,
}

/* ── какие упражнения ставить в первую очередь ── */

// Классика зала и дома: её ставим в план прежде экзотики (комбо, босу, слайдеры, одна рука и т. п.).
const STAPLE =
  /bench press|chest press|dumbbell bench|incline dumbbell|incline bench|dips|pull.?up|chin.?up|pulldown|bent over|barbell row|dumbbell row|single arm dumbbell row|seated (cable )?row|cable row|t-bar|chest supported|deadlift|overhead press|shoulder press|military|arnold|back squat|front squat|leg press|hack squat|goblet|bulgarian|lunge|hip thrust|glute bridge|romanian|step.?up|lateral raise|rear delt|face pull|biceps curl|dumbbell curl|hammer curl|barbell curl|preacher|pushdown|overhead (triceps|cable)|skull|leg curl|leg extension|calf raise|crossover|pec deck|fly|crunch|hanging|plank|push.?up|inverted row|squat|kickback|abduction|shrug/i
const EXOTIC =
  /single leg|one leg|glute bridge chest|bridge press| to |bosu|slider|trx|vipr|ball|b-stance|kneeling|alternate|elevated|clap|archer|one hand|one arm push|finger|knuckle|half|negative|spider|svend|cobra|handstand|landmine|plyo|jump|walking|lateral shuffle|march|hold|isometric|sissy|jefferson|zercher|pendlay|yates|gorilla|meadows|tate|waiter|reverse grip/i

function score(e: Exercise, p: Profile): number {
  const n = e.nameEn.toLowerCase()
  let s = 0
  if (STAPLE.test(n)) s += 50
  if (EXOTIC.test(n)) s -= 30
  if (isBackupModel(e)) s -= 25
  if (p.place === 'gym' && e.equipment === 'body weight' && !/pull.?up|chin.?up|dip|hanging|crunch|plank/.test(n)) s -= 15
  if (p.place === 'gym' && /band/.test(e.equipment)) s -= 15
  if (/knee push|incline push/.test(n) && p.level !== 'beginner') s -= 40
  if (p.level !== 'advanced' && e.difficulty === 'advanced') s -= 20
  if (p.level === 'beginner' && e.difficulty === 'intermediate') s -= 5
  return s
}

/* ── план ── */

export type Rx = { sets: number; min: number; max: number }

export type PlanItem = {
  exercise: Exercise
  /** Замены: другие упражнения того же слота и роли. */
  alts: Exercise[]
  rx: Rx
  /** Рекомендованный вес: kg — число; null — «свой вес» (bodyweight) или «подбор». */
  kg: number | null
  bodyweight: boolean
  /** Что изменилось к прошлому разу: '+2,5 кг', '+1 повтор', 'подбор' или ''. */
  change: string
  /** Прошлый раз: «60 кг × 10, 10, 9» или «12, 10 повторений»; '' — упражнения ещё не было. */
  prev: string
  rest: number
}

export type PlanDay = { day: number; title: string; items: PlanItem[] }
export type WeekPlan = { week: number; deload: boolean; days: (PlanDay | null)[] }

const META_KEY = 'onepercent:plan:v1'
type Meta = { start: string; seed: number }

function meta(): Meta {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (raw) return JSON.parse(raw) as Meta
  } catch {
    // нет хранилища — план всё равно строится
  }
  const now = new Date()
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
  const m = { start: monday.toISOString(), seed: Math.floor(Math.random() * 1e9) }
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m))
  } catch {
    // не критично
  }
  return m
}

// Одно и то же упражнение под разными названиями коллекций: «Классические отжимания» = «Отжимания».
const same = (name: string) => name.toLowerCase().replace(/^классические |, вариант \d+$|^стандартные /g, '')

// Семейства движений — не больше одного упражнения из семейства в тренировке.
const PATTERNS: [string, RegExp][] = [
  ['deadlift', /deadlift|good morning|rdl|stiff/i],
  ['squat', /squat|leg press|hack/i],
  ['lunge', /lunge|split|step.?up|step down|reverse step|drop step/i],
  ['bench', /bench press|chest press|floor press/i],
  ['overhead', /overhead press|shoulder press|military|arnold|push press/i],
  ['pullup', /pull.?up|chin.?up|pulldown/i],
  ['row', /row/i],
  ['hipthrust', /hip thrust|glute bridge|glute drive/i],
  ['calf', /calf/i],
]
const patternOf = (e: Exercise) => PATTERNS.find(([, re]) => re.test(e.nameEn))?.[0] ?? null

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

const rxFor = (p: Profile, kind: 'base' | 'iso', deload: boolean): Rx => {
  const g = p.goal
  const [min, max] =
    kind === 'base'
      ? g === 'strength' ? [4, 6] : g === 'fat_loss' || g === 'definition' ? [10, 12] : [8, 10]
      : g === 'strength' ? [8, 10] : g === 'fat_loss' || g === 'definition' ? [12, 15] : [10, 12]
  const sets = (kind === 'base' ? (p.level === 'beginner' ? 3 : 4) : 3) - (deload ? 1 : 0)
  return { sets, min, max }
}

const lastLog = (id: string, history: Workout[]): ExerciseLog | null => {
  for (let i = history.length - 1; i >= 0; i--) {
    const e = history[i].exercises.find((x) => x.exerciseId === id)
    if (e && e.sets.length) return e
  }
  return null
}

const isBodyweight = (e: Exercise) => e.equipment === 'body weight' || e.equipment === 'trx'
const step = (e: Exercise) => (['dumbbell', 'kettlebell'].includes(e.equipment) ? 2 : 2.5)
const round = (kg: number, s: number) => Math.round(kg / s) * s

// Стартовый вес из анкеты (рабочий вес на 8–12) — только для «тех самых» упражнений.
const startFromProfile = (e: Exercise, p: Profile): number | null => {
  if (e.equipment !== 'barbell') return null
  const n = e.nameEn.toLowerCase()
  if (/bench press/.test(n) && !/incline|close|wide|decline/.test(n)) return p.workingWeights.bench
  if (/back squat/.test(n) && !/elevated/.test(n)) return p.workingWeights.squat
  if (/deadlift/.test(n) && !/sumo|romanian|stiff|landmine|single|to |trap|hex|b-stance|smith/.test(n)) return p.workingWeights.deadlift
  return null
}

const kgStr = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace('.', ','))
const prevOf = (last: ExerciseLog | null, bw: boolean) => {
  if (!last) return ''
  const reps = last.sets.map((s) => s.reps).join(', ')
  if (bw) return `${reps} повторений`
  const work = Math.max(...last.sets.map((s) => s.weight))
  return `${kgStr(work)} кг × ${last.sets.filter((s) => s.weight === work).map((s) => s.reps).join(', ')}`
}

function dose(e: Exercise, rx: Rx, p: Profile, history: Workout[], deload: boolean) {
  const bw = isBodyweight(e)
  const last = lastLog(e.id, history)
  return { ...doseOf(e, rx, p, last, bw, deload), prev: prevOf(last, bw) }
}

function doseOf(e: Exercise, rx: Rx, p: Profile, last: ExerciseLog | null, bw: boolean, deload: boolean) {
  if (bw) {
    if (!last) return { kg: null, bodyweight: true, change: '' }
    const allTop = last.sets.every((s) => s.reps >= rx.max)
    return { kg: null, bodyweight: true, change: allTop && !deload ? '+1 повтор' : '' }
  }
  if (!last) {
    const kg = startFromProfile(e, p)
    return { kg, bodyweight: false, change: kg === null ? 'подбор' : '' }
  }
  const work = Math.max(...last.sets.map((s) => s.weight))
  const top = last.sets.filter((s) => s.weight === work)
  if (!deload && top.every((s) => s.reps >= rx.max)) {
    const s = step(e)
    return { kg: round(work + s, s / 2), bodyweight: false, change: `+${String(s).replace('.', ',')} кг` }
  }
  if (top.some((s) => s.reps < rx.min - 2)) {
    const s = step(e)
    return { kg: round(work - s, s / 2), bodyweight: false, change: '' }
  }
  return { kg: work, bodyweight: false, change: top.some((s) => s.reps < rx.max) && !deload ? '+1 повтор' : '' }
}

/** План текущей недели блока по анкете. Упражнения постоянны весь блок (4 недели) — чтобы расти в весе. */
export function weekPlan(p: Profile, history: Workout[] = getWorkouts(), at = new Date()): WeekPlan {
  const m = meta()
  const weeks = Math.max(0, Math.floor((at.getTime() - Date.parse(m.start)) / (7 * 86_400_000)))
  const block = Math.floor(weeks / 4)
  const week = (weeks % 4) + 1
  const deload = week === 4
  const seed = m.seed + block * 7919

  const per = Math.min(7, Math.max(1, p.perWeek ?? 3))
  const days = !p.autoDays && p.days.length ? [...p.days].sort((a, b) => a - b) : defaultDays[per]
  const tpl = split(days.length, p.level)
  const count = exercisesPerSession(p.minutes, p.level)
  const mix = sessionMix(count)
  const limits = p.limits.map((l) => avoid[l]).filter(Boolean)
  const prio = p.priorities.map((x) => prioritySlot[x]).filter(Boolean) as Slot[]

  const pool = myExercises().filter(
    (e) =>
      e.video &&
      (e.kind === 'base' || e.kind === 'iso') &&
      available(e, p) &&
      !(p.level === 'beginner' && e.difficulty === 'advanced') &&
      !limits.some((re) => re.test(e.nameEn)),
  )

  const plan: (PlanDay | null)[] = Array(7).fill(null)
  days.forEach((day, i) => {
    const t = tpl[i % tpl.length]
    const used = new Set<string>()
    // одно движение — один раз за тренировку: не три становых подряд
    const usedPattern = new Set<string>()
    const pick = (slot: Slot, kind: 'base' | 'iso', salt: string): { e: Exercise; alts: Exercise[] } | null => {
      const cands = (k: 'base' | 'iso') =>
        pool
          .filter((e) => e.kind === k && inSlot[slot](e) && !used.has(same(e.name)) && !(patternOf(e) && usedPattern.has(patternOf(e)!)))
          .sort((a, b) => score(b, p) - score(a, p) || hash(`${seed}:${i}:${salt}:${a.id}`) - hash(`${seed}:${i}:${salt}:${b.id}`))
      let list = cands(kind)
      if (!list.length) list = cands(kind === 'base' ? 'iso' : 'base')
      if (!list.length) return null
      // разнообразие: случайное (но постоянное на весь блок) из лучших трёх
      const top = list.filter((x) => score(x, p) >= score(list[0], p) - 10).slice(0, 3)
      const e = top[hash(`${seed}:${i}:${salt}`) % top.length]
      list = [e, ...list.filter((x) => x !== e)]
      used.add(same(e.name))
      const pt = patternOf(e)
      if (pt) usedPattern.add(pt)
      return { e, alts: list.slice(1, 6) }
    }
    const isoSlots = [...prio.filter((s) => t.base.includes(s) || t.iso.includes(s) || t.title === 'Всё тело'), ...t.iso]
    const chosen: { e: Exercise; alts: Exercise[]; kind: 'base' | 'iso' }[] = []
    for (const [k, slots, n] of [['base', t.base, mix.base], ['iso', isoSlots, mix.iso]] as const) {
      let got = 0
      for (let j = 0; got < n && j < slots.length * 2; j++) {
        const r = pick(slots[j % slots.length], k, `${k}${j}`)
        if (r) {
          chosen.push({ ...r, kind: k })
          got++
        }
      }
    }
    // базовые — первыми, изолирующие — добивка
    chosen.sort((a, b) => (a.e.kind === b.e.kind ? 0 : a.e.kind === 'base' ? -1 : 1))
    const items = chosen.map(({ e, alts }) => {
      const rx = rxFor(p, e.kind === 'base' ? 'base' : 'iso', deload)
      return { exercise: e, alts, rx, ...dose(e, rx, p, history, deload), rest: e.kind === 'base' ? 120 : 75 }
    })
    plan[day] = { day, title: t.title, items }
  })
  return { week, deload, days: plan }
}

/** Пересчитать рекомендацию для заменённого упражнения. */
export function itemFor(e: Exercise, alts: Exercise[], p: Profile, deload: boolean, history: Workout[] = getWorkouts()): PlanItem {
  const rx = rxFor(p, e.kind === 'base' ? 'base' : 'iso', deload)
  return { exercise: e, alts, rx, ...dose(e, rx, p, history, deload), rest: e.kind === 'base' ? 120 : 75 }
}

export const todayIndex = (d = new Date()) => (d.getDay() + 6) % 7
