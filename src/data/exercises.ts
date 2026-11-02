import { loadProfile } from '../onboarding'

// Упражнения Vital + видео Bunny. Сам файл данных платный и лежит вне git
// (src/data/private/vital.json, см. .gitignore). Если его нет — список пустой, сборка не падает.

export type Exercise = {
  id: string
  name: string
  nameEn: string
  bodyPart: string
  target: string
  secondary: string[]
  equipment: string
  /** Коллекция Vital: зальная или «400 home workouts». */
  collection: 'gym' | 'home'
  /** Снаряды, нужные по описанию Vital (и по кадру видео, где Vital молчит): pullup_bar, bench, box, dumbbell, band… */
  needs: string[]
  model: 'male' | 'female' | 'any'
  difficulty: string
  steps: string[]
  /** ar — пропорции кадра (ш/в): бывают квадратные, вертикальные и горизонтальные.
   *  bg — фон студии у краёв кадра (цвет или CSS-градиент): им заливаем поля, чтобы кадр не обрезался. */
  video: { guid: string; sec: number; res: string; ar?: number; bg?: string } | null
}

type VitalFile = { cdn: string; exercises: Exercise[] }

// Данные Vital лежат в public/data зашифрованными (AES-GCM, решение владельца от 2026-11-01).
const KEY_HEX = 'c5d5885dece19ca71279a5f573eba1ba1764674a204abeb63feb9e98100c5a23'

let data: VitalFile = { cdn: '', exercises: [] }
let loading: Promise<void> | null = null

const hex = (h: string) => new Uint8Array(h.match(/../g)!.map((b) => parseInt(b, 16)))

async function decrypt(buf: ArrayBuffer) {
  const key = await crypto.subtle.importKey('raw', hex(KEY_HEX), 'AES-GCM', false, ['decrypt'])
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12))
}

/** Загружает упражнения один раз; повторные вызовы ждут ту же загрузку. */
export function loadExercises(): Promise<void> {
  loading ??= (async () => {
    const gz = typeof DecompressionStream !== 'undefined'
    const res = await fetch(`${import.meta.env.BASE_URL}data/${gz ? 'ex.gz.bin' : 'ex.bin'}`)
    if (!res.ok) throw new Error(`exercises: ${res.status}`)
    let plain = await decrypt(await res.arrayBuffer())
    if (gz) plain = await new Response(new Blob([plain]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
    data = JSON.parse(new TextDecoder().decode(plain)) as VitalFile
  })().catch((e) => {
    loading = null
    throw e
  })
  return loading
}

// Персонаж своего пола: мужчинам — только мужские манекены, женщинам — только женские
// (домашняя коллекция Vital снята на девушке). Пол не указан — показываем всё.
// Пол читается при каждом обращении: анкету могли пройти уже после загрузки.
const forMe = (e: Exercise) => {
  const gender = loadProfile()?.gender
  if (!gender) return true
  return e.model === gender || (e.model === 'any' && gender === 'female')
}

/* ── Где можно выполнить упражнение: Зал / Дом / Без инвентаря ──
   Одна функция на всю библиотеку. Источник — поле equipment Vital и снаряды из описания (needs):
   у Vital «body weight» стоит и у подтягиваний, брусьев, скамьи, поэтому смотрим оба. */
export type Place = 'gym' | 'home' | 'none'

// Инвентарь, которого дома нет: тренажёры, блоки, штанги, стационарные снаряды.
const GYM_EQUIPMENT = new Set([
  'barbell', 'machine', 'cable', 'leverage machine', 'smith machine', 'hex bar', 'trap bar',
  'sled', 'battle rope', 'rope', 'assisted', 'vipr', 'trx',
])
// Снаряды из описания, которых дома нет.
const GYM_NEEDS = new Set([
  'pullup_bar', 'dip_bars', 'bench', 'box', 'roman_chair', 'rack', 'machine', 'barbell',
  'suspension', 'parallettes', 'rings',
])
// В домашней коллекции Vital «скамья» и «тумба» — это диван, стул, ступенька.
const FURNITURE = new Set(['bench', 'box'])

const needsOf = (e: Exercise) => (e.collection === 'home' ? e.needs.map((n) => (FURNITURE.has(n) ? 'chair' : n)) : e.needs)

export function placesOf(e: Exercise): Place[] {
  const needs = needsOf(e)
  const bodyweight = e.equipment === 'body weight'
  const stationary = GYM_EQUIPMENT.has(e.equipment) || needs.some((n) => GYM_NEEDS.has(n))
  const out: Place[] = []
  if (!bodyweight || stationary) out.push('gym')
  if (!stationary) out.push('home')
  if (bodyweight && needs.length === 0) out.push('none')
  return out
}

export type Group = {
  id: string
  name: string
  parts: string[]
  /** Отбор внутри группы (например, бицепс внутри «Рук»). */
  match?: (e: Exercise) => boolean
  /** Подгруппы: сначала выбираем их, потом список. */
  subs?: Group[]
}

const arms = ['upper arms', 'lower arms']

export const groups: Group[] = [
  { id: 'chest', name: 'Грудь', parts: ['chest'] },
  { id: 'back', name: 'Спина', parts: ['back', 'neck'] },
  { id: 'shoulders', name: 'Плечи', parts: ['shoulders'] },
  {
    id: 'arms',
    name: 'Руки',
    parts: arms,
    subs: [
      { id: 'biceps', name: 'Бицепс', parts: arms, match: (e) => e.target === 'biceps' },
      { id: 'triceps', name: 'Трицепс', parts: arms, match: (e) => e.target !== 'biceps' && e.target !== 'forearms' },
      { id: 'forearms', name: 'Предплечья', parts: arms, match: (e) => e.target === 'forearms' },
    ],
  },
  { id: 'legs', name: 'Ноги', parts: ['upper legs', 'lower legs'] },
  { id: 'abs', name: 'Пресс', parts: ['waist'] },
  { id: 'cardio', name: 'Кардио', parts: ['cardio'] },
]

export const byGroup = (g: Group, place?: Place) =>
  data.exercises.filter(
    (e) => g.parts.includes(e.bodyPart) && (!g.match || g.match(e)) && (!place || placesOf(e).includes(place)) && forMe(e),
  )

export const videoUrl = (e: Exercise) => (e.video ? `${data.cdn}/${e.video.guid}/play_${e.video.res}.mp4` : '')
export const posterUrl = (e: Exercise) => (e.video ? `${data.cdn}/${e.video.guid}/thumbnail.jpg` : '')

const equipmentRu: Record<string, string> = {
  barbell: 'Штанга',
  dumbbell: 'Гантели',
  machine: 'Тренажёр',
  cable: 'Блок',
  'body weight': 'Свой вес',
  kettlebell: 'Гиря',
  band: 'Резинка',
  'resistance band': 'Резинка',
  'medicine ball': 'Медбол',
  'leverage machine': 'Тренажёр',
  'smith machine': 'Смит',
  'exercise ball': 'Фитбол',
  'bosu ball': 'Босу',
  trx: 'TRX',
  'battle rope': 'Канат',
  rope: 'Канат',
  'hex bar': 'Трэп-гриф',
  'trap bar': 'Трэп-гриф',
  'ab wheel': 'Ролик',
  plate: 'Блин',
  sled: 'Сани',
}
const levelRu: Record<string, string> = {
  beginner: 'Новичок',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}
const muscleRu: Record<string, string> = {
  chest: 'Грудь',
  pectorals: 'Грудь',
  'upper chest': 'Верх груди',
  core: 'Кор',
  waist: 'Пресс',
  'hip flexors': 'Сгибатели бедра',
  rhomboids: 'Ромбовидные',
  adductors: 'Приводящие',
  'hip adductors': 'Приводящие',
  'inner thighs': 'Внутр. бедро',
  abductors: 'Отводящие',
  'hip abductors': 'Отводящие',
  'upper arms': 'Руки',
  'lower legs': 'Голени',
  cardio: 'Кардио',
  'cardiovascular system': 'Кардио',
  'upper back': 'Верх спины',
  soleus: 'Камбаловидная',
  neck: 'Шея',
  'rotator cuff': 'Ротаторы',
  brachialis: 'Плечевая',
  brachioradialis: 'Плечелучевая',
  supraspinatus: 'Надостная',
  'upper traps': 'Верх трапеций',
  'middle traps': 'Середина трапеций',
  'tensor fasciae latae': 'Напрягатель фасции',
  'teres major': 'Большая круглая',
  deltoids: 'Дельты',
  'ankle stabilizers': 'Стабилизаторы стопы',
  'lower chest': 'Низ груди',
  triceps: 'Трицепс',
  biceps: 'Бицепс',
  shoulders: 'Плечи',
  delts: 'Дельты',
  'front delts': 'Передние дельты',
  'lateral delts': 'Средние дельты',
  'rear delts': 'Задние дельты',
  lats: 'Широчайшие',
  traps: 'Трапеции',
  back: 'Спина',
  'lower back': 'Поясница',
  abs: 'Пресс',
  obliques: 'Косые',
  quads: 'Квадрицепсы',
  glutes: 'Ягодицы',
  hamstrings: 'Бицепс бедра',
  calves: 'Икры',
  'upper legs': 'Бёдра',
  'lower arms': 'Предплечья',
  forearms: 'Предплечья',
}

const needRu: Record<string, string> = {
  pullup_bar: 'Турник',
  dip_bars: 'Брусья',
  bench: 'Скамья',
  box: 'Тумба',
  roman_chair: 'Стойка для пресса',
  rack: 'Стойка',
  machine: 'Тренажёр',
  barbell: 'Штанга',
  suspension: 'TRX',
  parallettes: 'Параллетсы',
  rings: 'Кольца',
  dumbbell: 'Гантели',
  kettlebell: 'Гиря',
  plate: 'Блин',
  medicine_ball: 'Медбол',
  stability_ball: 'Фитбол',
  band: 'Резинка',
  slider: 'Слайдеры',
  ab_wheel: 'Ролик',
  ladder: 'Коорд. лестница',
  chair: 'Стул',
  weight: 'Отягощение',
}

export const equipmentName = (s: string) => equipmentRu[s] ?? s

/** Подпись инвентаря: у Vital «свой вес» стоит и там, где нужен турник или блин — берём снаряд из описания. */
export const equipmentOf = (e: Exercise) => {
  if (e.equipment !== 'body weight') return equipmentName(e.equipment)
  const need = needsOf(e).find((n) => needRu[n])
  return need ? needRu[need] : equipmentName(e.equipment)
}
export const levelName = (s: string) => levelRu[s] ?? s
export const muscleName = (s: string) => muscleRu[s.toLowerCase()] ?? s
