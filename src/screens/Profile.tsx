import { useState, useSyncExternalStore } from 'react'
import { ChevronRightIcon, UserIcon } from '../components/Icons'
import { NumericWheelPicker } from '../components/NumericWheelPicker'
import { addWeight, getWeights, subscribeWeights } from '../data/body'
import { ResetOnboardingButton } from '../dev/ResetOnboardingButton'
import { loadProfile, saveProfile, type Lift, type Profile as ProfileData } from '../onboarding'
import { telegramUser } from '../telegram'
import { goals, levels, places } from './onboarding/Onboarding'

// Профиль — «кто я и как меня тренировать»: тело, параметры программы, настройки.
// Графики силы и рекорды — в «Прогрессе», тренировка дня — на Главной; здесь их нет.

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const lifts: { id: Lift; name: string }[] = [
  { id: 'bench', name: 'Жим лёжа' },
  { id: 'squat', name: 'Присед' },
  { id: 'deadlift', name: 'Становая' },
]

const num = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace('.', ','))
const signed = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${num(Math.abs(x))}`
const dateRu = (t: string) => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '')

type Picking = { kind: 'weight' } | { kind: 'lift'; lift: Lift } | null

export function Profile({ onRestartOnboarding }: { onRestartOnboarding: () => void }) {
  const [p, setP] = useState<ProfileData | null>(loadProfile)
  const weights = useSyncExternalStore(subscribeWeights, getWeights, getWeights)
  const [picking, setPicking] = useState<Picking>(null)
  const user = telegramUser()

  const update = (next: ProfileData) => {
    saveProfile(next)
    setP(next)
  }

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Атлет One%'
  const goal = goals.find((g) => g.id === p?.goal)?.title
  const level = levels.find((l) => l.id === p?.level)?.title

  return (
    <main className="pf">
      <header className="pf__head">
        <h1 className="pf__title">Профиль</h1>
        <div className="pf-me">
          <span className="icon-disc pf-me__ava">
            {user?.photo_url ? <img src={user.photo_url} alt="" /> : <UserIcon />}
          </span>
          <span className="pf-me__text">
            <span className="pf-me__name">{name}</span>
            <span className="pf-me__sub">{[goal, level].filter(Boolean).join(' · ') || 'Анкета не заполнена'}</span>
          </span>
        </div>
      </header>

      <div className="pf__body">
        <BodyCard p={p} weights={weights} onUpdate={() => setPicking({ kind: 'weight' })} />
        {p && <ProgramCard p={p} onLift={(lift) => setPicking({ kind: 'lift', lift })} />}

        <section className="card pf-list" aria-label="Настройки">
          <h2 className="pf-card__title">Настройки</h2>
          <Row k="Единицы" v="кг, см" />
          <button type="button" className="pf-row pf-row--btn tappable" onClick={() => exportData(p, weights)}>
            <span className="pf-row__k">Мои данные</span>
            <span className="pf-row__v">Скачать</span>
            <ChevronRightIcon className="pf-row__go" />
          </button>
        </section>

        <ResetOnboardingButton onReset={onRestartOnboarding} />
      </div>

      <NumericWheelPicker
        open={picking !== null}
        title={picking?.kind === 'lift' ? `${lifts.find((l) => l.id === picking.lift)?.name}, рабочий вес` : 'Вес сегодня'}
        value={
          picking?.kind === 'lift'
            ? (p?.workingWeights[picking.lift] ?? 40)
            : (weights.at(-1)?.kg ?? p?.weight ?? (p?.gender === 'female' ? 60 : 75))
        }
        min={picking?.kind === 'lift' ? 0 : 35}
        max={picking?.kind === 'lift' ? 300 : 250}
        step={picking?.kind === 'lift' ? 2.5 : 0.1}
        unit="кг"
        onClose={() => setPicking(null)}
        onConfirm={(v) => {
          if (picking?.kind === 'weight') {
            addWeight(v)
            setP(loadProfile())
          } else if (picking?.kind === 'lift' && p) {
            update({ ...p, workingWeights: { ...p.workingWeights, [picking.lift]: v } })
          }
          setPicking(null)
        }}
      />
    </main>
  )
}

function BodyCard({ p, weights, onUpdate }: { p: ProfileData | null; weights: { date: string; kg: number }[]; onUpdate: () => void }) {
  const first = weights[0]
  const last = weights.at(-1)
  const now = last?.kg ?? p?.weight ?? null
  const target = p?.targetWeight ?? null
  const start = first?.kg ?? now
  // путь к цели: доля пройденного от стартового веса до желаемого
  const path = now !== null && target !== null && start !== null && start !== target
    ? Math.min(1, Math.max(0, (start - now) / (start - target)))
    : null
  const delta = now !== null && start !== null && weights.length > 1 ? now - start : null

  return (
    <section className="card pf-body" aria-label="Тело">
      <div className="pf-card__head">
        <h2 className="pf-card__title">Тело</h2>
        {last && <span className="pf-card__meta">обновлено {dateRu(last.date)}</span>}
      </div>
      <div className="pf-body__nums">
        <Stat k="Вес" v={now !== null ? num(now) : '—'} u="кг" />
        <Stat k="Цель" v={target !== null ? num(target) : '—'} u="кг" />
        <Stat k="Рост" v={p?.height != null ? String(p.height) : '—'} u="см" />
        <Stat k="Возраст" v={p?.age != null ? String(p.age) : '—'} u="лет" />
      </div>
      {path !== null && (
        <div className="pf-path">
          <div className="pf-path__bar">
            <span style={{ width: `${Math.round(path * 100)}%` }} />
          </div>
          <div className="pf-path__meta">
            <span>{num(start!)} кг</span>
            <span>{delta !== null ? `${signed(delta)} кг с начала` : 'путь к цели'}</span>
            <span>{num(target!)} кг</span>
          </div>
        </div>
      )}
      <button type="button" className="cta tappable pf-body__cta" onClick={onUpdate}>
        Обновить вес
      </button>
    </section>
  )
}

function ProgramCard({ p, onLift }: { p: ProfileData; onLift: (l: Lift) => void }) {
  const place = places.find((x) => x.id === p.place)?.title
  const days = p.autoDays ? 'дни подберёт тренер' : p.days.map((d) => weekDays[d]).join(', ')
  return (
    <section className="card pf-list" aria-label="Моя программа">
      <div className="pf-card__head">
        <h2 className="pf-card__title">Моя программа</h2>
        <span className="pf-card__meta">по ней тренер строит тренировки</span>
      </div>
      <Row k="Цель" v={goals.find((g) => g.id === p.goal)?.title} />
      <Row k="Уровень" v={levels.find((l) => l.id === p.level)?.title} />
      <Row k="Где тренируюсь" v={[place, p.equipment.length ? p.equipment.join(', ') : ''].filter(Boolean).join(' · ')} />
      <Row k="График" v={p.perWeek ? `${p.perWeek} в неделю${days ? ` · ${days}` : ''}` : undefined} />
      <Row k="Длительность" v={p.minutes ? `${p.minutes} мин` : undefined} />
      <Row k="Приоритет" v={p.priorities.join(', ')} />
      <Row k="Ограничения" v={p.limits.join(', ')} />
      <div className="pf-lifts">
        <span className="pf-row__k">Рабочие веса</span>
        <div className="pf-lifts__grid">
          {lifts.map((l) => (
            <button key={l.id} type="button" className="pf-lift tappable" onClick={() => onLift(l.id)}>
              <span className="pf-lift__v">
                {p.workingWeights[l.id] !== null ? num(p.workingWeights[l.id]!) : '—'}
                <small>кг</small>
              </span>
              <span className="pf-lift__k">{l.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

const Stat = ({ k, v, u }: { k: string; v: string; u: string }) => (
  <div className="pf-stat">
    <span className="pf-stat__v">
      {v}
      <small>{u}</small>
    </span>
    <span className="pf-stat__k">{k}</span>
  </div>
)

const Row = ({ k, v }: { k: string; v?: string }) => (
  <div className="pf-row">
    <span className="pf-row__k">{k}</span>
    <span className={`pf-row__v${v ? '' : ' is-empty'}`}>{v || 'не указано'}</span>
  </div>
)

/** «Мои данные»: анкета и история веса одним файлом. */
function exportData(p: ProfileData | null, weights: { date: string; kg: number }[]) {
  const blob = new Blob([JSON.stringify({ profile: p, weights }, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'onepercent-data.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
