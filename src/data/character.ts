// Персонаж приложения — по полу из анкеты (решение владельца 2026-11-03): Главная и «Прогресс».
// Кадры 853×799 обрезаны из исходников владельца без изменений (персонаж не перерисовывается).
import female from '../assets/hero-female.webp'
import male from '../assets/hero-male.webp'
import { loadProfile } from '../onboarding'

export type Anchor = { x: number; y: number; side: 'l' | 'r'; ly: number }
type Zone = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'abs'

export type Character = { src: string; w: number; h: number; anchors: Record<Zone, Anchor> }

const W = 853
const H = 799

// Точки на мышцах (координаты кадра) и высота подписи; подписи слева/справа от фигуры.
const characters: Record<'male' | 'female', Character> = {
  male: {
    src: male,
    w: W,
    h: H,
    anchors: {
      chest: { x: 372, y: 318, side: 'l', ly: 262 },
      back: { x: 312, y: 405, side: 'l', ly: 410 },
      legs: { x: 330, y: 640, side: 'l', ly: 600 },
      shoulders: { x: 572, y: 300, side: 'r', ly: 230 },
      arms: { x: 594, y: 400, side: 'r', ly: 380 },
      abs: { x: 448, y: 470, side: 'r', ly: 520 },
    },
  },
  female: {
    src: female,
    w: W,
    h: H,
    anchors: {
      chest: { x: 392, y: 262, side: 'l', ly: 225 },
      back: { x: 345, y: 330, side: 'l', ly: 360 },
      legs: { x: 360, y: 640, side: 'l', ly: 560 },
      shoulders: { x: 520, y: 240, side: 'r', ly: 190 },
      arms: { x: 545, y: 330, side: 'r', ly: 330 },
      abs: { x: 440, y: 405, side: 'r', ly: 470 },
    },
  },
}

/** Персонаж своего пола; пол не указан — мужской. */
export const myCharacter = () => characters[loadProfile()?.gender === 'female' ? 'female' : 'male']
