// Иконки групп мышц для раздела «Упражнения»: тёмная фигура, нужная группа подсвечена голубым.
// Картинки — src/assets/groups/*.webp (прозрачный фон, 256×256), согласованы владельцем 2026-11-02.
import abs from '../assets/groups/abs.webp'
import arms from '../assets/groups/arms.webp'
import back from '../assets/groups/back.webp'
import biceps from '../assets/groups/biceps.webp'
import cardio from '../assets/groups/cardio.webp'
import chest from '../assets/groups/chest.webp'
import forearms from '../assets/groups/forearms.webp'
import legs from '../assets/groups/legs.webp'
import shoulders from '../assets/groups/shoulders.webp'
import triceps from '../assets/groups/triceps.webp'

const icons = { chest, back, shoulders, arms, legs, abs, cardio, biceps, triceps, forearms }

export type MuscleZone = keyof typeof icons

export function MuscleIcon({ zone, className = '' }: { zone: MuscleZone; className?: string }) {
  return <img className={`mi ${className}`} src={icons[zone]} alt="" draggable={false} />
}
