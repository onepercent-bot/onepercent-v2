// «Что улучшить» — разбор по уже посчитанным показателям (src/data/progress.ts).
// Сейчас правила детерминированные: текст строится из реальных цифр пользователя, поэтому у всех разный.
// AI-тренер (поставщик модели ещё не выбран, см. docs/DECISIONS.md) будет получать на вход тот же
// ProgressReport и заменит эту функцию — цифры при этом по-прежнему считает progress.ts, не модель.

import { groupName, periodDays, type GroupId, type ProgressReport } from './progress'

const pct = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${Math.round(Math.abs(x) * 100)}%`
const MAIN: GroupId[] = ['chest', 'back', 'legs']
const plural = new Set<GroupId>(['shoulders', 'arms', 'legs'])
const grows = (g: GroupId) => (plural.has(g) ? 'прогрессируют' : 'прогрессирует')

export type Insight = { text: string; /** группа, упражнения которой стоит открыть */ group?: GroupId }

export function insight(r: ProgressReport, totalWorkouts: number): Insight {
  let group: GroupId | undefined
  const span = r.period === 'week' ? 'неделю' : `${periodDays.month} дней`
  if (!totalWorkouts) return { text: 'Пока нет записанных тренировок. После 2–3 тренировок здесь появится разбор: что растёт, а что отстаёт.' }
  if (!r.sessions) return { text: `За последние ${span} тренировок не было. Начните с той же программы — сравним с прошлыми результатами.` }
  if (!r.groups.length)
    return { text: 'Повторите те же упражнения ещё раз — тогда станет видно, где вы прибавили, а где нет.' }

  const parts: string[] = []
  const down = r.groups.filter((g) => g.change <= -0.03)
  if (down.length) {
    const g = down[down.length - 1]
    group = g.group
    parts.push(
      `${groupName[g.group]}: результат снизился (${pct(g.change)}). Проверьте восстановление — сон, питание и не меньше 48 часов отдыха между тренировками этой группы.`,
    )
  }
  const up = r.groups.filter((g) => g.change > -0.03)
  if (up.length >= 2) {
    const lead = up[0]
    const lag = up[up.length - 1]
    if (lead.change - lag.change >= 0.05) {
      group ??= lag.group
      parts.push(
        `${groupName[lag.group]} ${grows(lag.group)} медленнее, чем ${groupName[lead.group].toLowerCase()} (${pct(lag.change)} против ${pct(lead.change)}). В следующем цикле добавьте 1–2 рабочих подхода на ${groupName[lag.group].toLowerCase()}.`,
      )
    }
  }
  const trained = new Set(r.groups.map((g) => g.group))
  const missed = MAIN.filter((g) => !trained.has(g) && !r.exercises.some((e) => e.group === g))
  if (missed.length && parts.length < 2) {
    group ??= missed[0]
    parts.push(`За ${span} нет сравнимых результатов: ${missed.map((g) => groupName[g].toLowerCase()).join(', ')}. Включите их в план, чтобы нагрузка была равномерной.`)
  }
  if (!parts.length) {
    const best = r.groups[0]
    parts.push(`Все группы растут, лучше всего — ${groupName[best.group].toLowerCase()} (${pct(best.change)}). Продолжайте прибавлять вес понемногу, по 2,5–5%.`)
  }
  return { text: parts.slice(0, 2).join(' '), group }
}
