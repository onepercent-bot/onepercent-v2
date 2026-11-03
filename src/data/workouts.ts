// История тренировок пользователя — единственный источник данных для раздела «Прогресс».
// Хранится на устройстве (localStorage); позже переедет на сервер вместе с анкетой (очередь модулей, п. 5).
// Записывать тренировки будет модуль «Тренировочный процесс» через saveWorkout().

export type SetLog = { weight: number; reps: number }

export type ExerciseLog = {
  /** id упражнения Vital (как в src/data/exercises.ts). */
  exerciseId: string
  name: string
  bodyPart: string
  target: string
  sets: SetLog[]
}

export type Workout = {
  id: string
  /** ISO-дата и время окончания тренировки. */
  date: string
  exercises: ExerciseLog[]
}

const KEY = 'onepercent:workouts:v1'
const EVENT = 'onepercent:workouts'

let cache: { raw: string | null; list: Workout[] } = { raw: null, list: [] }

const read = (): string | null => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** Все тренировки, по возрастанию даты. Ссылка стабильна, пока данные не менялись. */
export function getWorkouts(): Workout[] {
  const raw = read()
  if (raw === cache.raw) return cache.list
  let list: Workout[] = []
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (Array.isArray(parsed)) list = parsed.filter(isWorkout)
  } catch {
    list = []
  }
  list.sort((a, b) => a.date.localeCompare(b.date))
  cache = { raw, list }
  return list
}

/** Сохраняет тренировку; прогресс и рекорды пересчитываются у всех подписчиков. */
export function saveWorkout(w: Workout) {
  const list = [...getWorkouts().filter((x) => x.id !== w.id), w]
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    return
  }
  window.dispatchEvent(new Event(EVENT))
}

export function subscribeWorkouts(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb()
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', onStorage)
  }
}

function isWorkout(x: unknown): x is Workout {
  const w = x as Workout
  return (
    !!w &&
    typeof w.id === 'string' &&
    typeof w.date === 'string' &&
    !Number.isNaN(Date.parse(w.date)) &&
    Array.isArray(w.exercises) &&
    w.exercises.every(
      (e) =>
        e &&
        typeof e.exerciseId === 'string' &&
        Array.isArray(e.sets) &&
        e.sets.every((s) => s && Number.isFinite(s.weight) && Number.isFinite(s.reps)),
    )
  )
}
