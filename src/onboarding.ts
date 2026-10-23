const KEY = 'onepercent:onboarded:v2'
const PROFILE_KEY = 'onepercent:profile:v2'

export type Gender = 'male' | 'female'
export type Goal = 'muscle' | 'fat_loss' | 'strength' | 'definition' | 'maintain'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Place = 'gym' | 'home_equipment' | 'home_bodyweight' | 'outdoor'
export type Lift = 'bench' | 'squat' | 'deadlift'

/** Ответы анкеты — на их основе строится персональная программа. */
export type Profile = {
  gender: Gender | null
  age: number | null
  height: number | null
  weight: number | null
  targetWeight: number | null
  goal: Goal | null
  level: Level | null
  place: Place | null
  equipment: string[]
  perWeek: number | null
  days: number[]
  autoDays: boolean
  minutes: number | null
  priorities: string[]
  limits: string[]
  notes: string
  /** Рабочие веса (кг, на 8–12 повторений) — стартовые веса для персональных тренировок. null — не указан. */
  workingWeights: Record<Lift, number | null>
}

export const emptyProfile: Profile = {
  gender: null,
  age: null,
  height: null,
  weight: null,
  targetWeight: null,
  goal: null,
  level: null,
  place: null,
  equipment: [],
  perWeek: null,
  days: [],
  autoDays: false,
  minutes: null,
  priorities: [],
  limits: [],
  notes: '',
  workingWeights: { bench: null, squat: null, deadlift: null },
}

/** Прошёл ли пользователь onboarding. Пока хранится на устройстве; позже — из API. */
export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // хранилище недоступно — не критично
  }
}

/** Сохраняет анкету на устройстве до появления API. */
export function saveProfile(profile: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, savedAt: new Date().toISOString() }))
  } catch {
    // хранилище недоступно — не критично
  }
}

/** Сбрасывает статус и ответы анкеты (для повторного прохождения). */
export function resetOnboarding() {
  try {
    localStorage.removeItem(KEY)
    localStorage.removeItem(PROFILE_KEY)
  } catch {
    // хранилище недоступно — не критично
  }
}
