const KEY = 'onepercent:onboarded'
const PROFILE_KEY = 'onepercent:profile'

export type Gender = 'male' | 'female'
export type Goal = 'muscle' | 'fat_loss' | 'strength' | 'definition' | 'maintain'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Place = 'gym' | 'home_equipment' | 'home_bodyweight' | 'outdoor'

/** Ответы анкеты — на их основе строится персональная программа. */
export type Profile = {
  gender: Gender | null
  age: string
  height: string
  weight: string
  targetWeight: string
  goal: Goal | null
  level: Level | null
  bench: string
  benchUnknown: boolean
  place: Place | null
  equipment: string[]
  perWeek: number | null
  days: number[]
  autoDays: boolean
  minutes: number | null
  priorities: string[]
  limits: string[]
  notes: string
}

export const emptyProfile: Profile = {
  gender: null,
  age: '',
  height: '',
  weight: '',
  targetWeight: '',
  goal: null,
  level: null,
  bench: '',
  benchUnknown: false,
  place: null,
  equipment: [],
  perWeek: null,
  days: [],
  autoDays: false,
  minutes: null,
  priorities: [],
  limits: [],
  notes: '',
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
