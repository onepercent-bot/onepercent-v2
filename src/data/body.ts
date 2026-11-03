// История веса тела — для блока «Тело» в Профиле. Хранится на устройстве, позже — на сервере вместе с анкетой.
// Текущий вес дублируется в анкету (Profile.weight), чтобы AI-тренер видел актуальное значение.
import { loadProfile, saveProfile } from '../onboarding'

export type WeightEntry = { date: string; kg: number }

const KEY = 'onepercent:weight:v1'
const EVENT = 'onepercent:weight'

let cache: { raw: string | null; list: WeightEntry[] } = { raw: null, list: [] }

/** Записи веса по возрастанию даты; первая — вес из анкеты. */
export function getWeights(): WeightEntry[] {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    // недоступно
  }
  if (raw === cache.raw) return cache.list
  let list: WeightEntry[] = []
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    if (Array.isArray(parsed))
      list = parsed.filter((e): e is WeightEntry => typeof e?.date === 'string' && typeof e?.kg === 'number')
  } catch {
    list = []
  }
  if (list.length === 0) {
    const p = loadProfile() as (ReturnType<typeof loadProfile> & { savedAt?: string }) | null
    if (p?.weight) list = [{ date: p.savedAt ?? new Date().toISOString(), kg: p.weight }]
  }
  list.sort((a, b) => a.date.localeCompare(b.date))
  cache = { raw, list }
  return list
}

/** Записывает новый вес (одна запись в день) и обновляет анкету. */
export function addWeight(kg: number) {
  const now = new Date().toISOString()
  const day = now.slice(0, 10)
  const list = [...getWeights().filter((e) => e.date.slice(0, 10) !== day), { date: now, kg }]
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    return
  }
  const p = loadProfile()
  if (p) saveProfile({ ...p, weight: kg })
  window.dispatchEvent(new Event(EVENT))
}

export function subscribeWeights(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}
