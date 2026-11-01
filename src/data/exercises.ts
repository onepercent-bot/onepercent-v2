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
  place: 'gym' | 'home'
  model: 'male' | 'female' | 'any'
  difficulty: string
  steps: string[]
  video: { guid: string; sec: number; res: string } | null
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

// Видео с персонажем своего пола: мужчинам — мужские манекены, женщинам — женские.
// Домашняя коллекция одна на всех. Пол не указан — показываем всё.
// Пол читается при каждом обращении: анкету могли пройти уже после загрузки приложения.
const forMe = (e: Exercise) => {
  const gender = loadProfile()?.gender
  return !gender || e.model === 'any' || e.model === gender
}

export type Group ={ id: string; name: string; parts: string[] }

export const groups: Group[] = [
  { id: 'chest', name: 'Грудь', parts: ['chest'] },
  { id: 'back', name: 'Спина', parts: ['back', 'neck'] },
  { id: 'shoulders', name: 'Плечи', parts: ['shoulders'] },
  { id: 'arms', name: 'Руки', parts: ['upper arms', 'lower arms'] },
  { id: 'legs', name: 'Ноги', parts: ['upper legs', 'lower legs'] },
  { id: 'abs', name: 'Пресс', parts: ['waist'] },
  { id: 'cardio', name: 'Кардио', parts: ['cardio'] },
]

export const byGroup = (g: Group, place?: Exercise['place']) =>
  data.exercises.filter((e) => g.parts.includes(e.bodyPart) && (!place || e.place === place) && forMe(e))

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

export const equipmentName = (s: string) => equipmentRu[s] ?? s
export const levelName = (s: string) => levelRu[s] ?? s
export const muscleName = (s: string) => muscleRu[s.toLowerCase()] ?? s
