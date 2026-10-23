import { useEffect, useState, type ReactNode } from 'react'
import benchImg from '../../assets/exercises/bench.webp'
import squatImg from '../../assets/exercises/squat.webp'
import deadliftImg from '../../assets/exercises/deadlift.webp'
import {
  ArrowRightIcon,
  BodyIcon,
  BoltIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DumbbellIcon,
  FlameIcon,
  GymIcon,
  HeartIcon,
  PullUpBarIcon,
  PulseIcon,
} from '../../components/Icons'
import { NumericWheelPicker } from '../../components/NumericWheelPicker'
import { emptyProfile, type Goal, type Level, type Lift, type Place, type Profile } from '../../onboarding'

const STEPS = 6

const goals: { id: Goal; title: string; sub: string; icon: ReactNode }[] = [
  { id: 'muscle', title: 'Набрать мышечную массу', sub: 'Больше мышц и объёма', icon: <DumbbellIcon className="ob-i-dumbbell" /> },
  { id: 'fat_loss', title: 'Похудеть и подтянуть тело', sub: 'Меньше жира, плотнее мышцы', icon: <FlameIcon /> },
  { id: 'strength', title: 'Стать сильнее', sub: 'Рост рабочих весов', icon: <BoltIcon className="ob-i-bolt" /> },
  { id: 'definition', title: 'Рельеф и выносливость', sub: 'Сухое тело и запас сил', icon: <PulseIcon /> },
  { id: 'maintain', title: 'Поддерживать форму', sub: 'Здоровье и тонус', icon: <HeartIcon /> },
]

const levels: { id: Level; title: string; sub: string; bars: number }[] = [
  { id: 'beginner', title: 'Новичок', sub: 'до 6 месяцев', bars: 1 },
  { id: 'intermediate', title: 'Средний', sub: '6 месяцев – 2 года', bars: 2 },
  { id: 'advanced', title: 'Опытный', sub: 'более 2 лет', bars: 3 },
]

const places: { id: Place; title: string; sub: string; icon: ReactNode }[] = [
  { id: 'gym', title: 'Тренажёрный зал', sub: 'Всё оборудование', icon: <GymIcon /> },
  { id: 'home_equipment', title: 'Дома с инвентарём', sub: 'Гантели, турник и т. п.', icon: <DumbbellIcon className="ob-i-dumbbell" /> },
  { id: 'home_bodyweight', title: 'Дома без инвентаря', sub: 'Только вес тела', icon: <BodyIcon /> },
  { id: 'outdoor', title: 'На улице', sub: 'Турник и брусья', icon: <PullUpBarIcon /> },
]

const equipmentList = ['Гантели', 'Штанга', 'Турник', 'Скамья', 'Резинки', 'Гиря', 'Брусья']
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const muscles = ['Грудь', 'Спина', 'Плечи', 'Руки', 'Пресс', 'Ноги', 'Ягодицы']
const NO_PRIORITY = 'Без приоритета'
const limitList = ['Спина / поясница', 'Колени', 'Плечи', 'Локти', 'Запястья', 'Шея']
const NO_LIMITS = 'Нет ограничений'

const lifts: { id: Lift; title: string; img: string; start: number }[] = [
  { id: 'bench', title: 'Жим лёжа', img: benchImg, start: 40 },
  { id: 'squat', title: 'Присед', img: squatImg, start: 50 },
  { id: 'deadlift', title: 'Становая тяга', img: deadliftImg, start: 60 },
]

/** Параметры барабана для числовых полей анкеты. start — где барабан открывается, если значения ещё нет. */
type NumKey = 'age' | 'height' | 'weight' | 'targetWeight'
const numFields: { key: NumKey; label: string; unit: string; min: number; max: number; start: (p: Profile) => number }[] = [
  { key: 'age', label: 'Возраст', unit: 'лет', min: 14, max: 80, start: () => 25 },
  { key: 'height', label: 'Рост', unit: 'см', min: 120, max: 230, start: (p) => (p.gender === 'female' ? 165 : 175) },
  { key: 'weight', label: 'Вес', unit: 'кг', min: 35, max: 250, start: (p) => (p.gender === 'female' ? 60 : 75) },
  { key: 'targetWeight', label: 'Желаемый вес', unit: 'кг', min: 35, max: 250, start: (p) => p.weight ?? (p.gender === 'female' ? 60 : 75) },
]

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

/** Мульти-выбор с вариантом «ничего», который снимает остальные. */
const toggleWithNone = (list: string[], item: string, none: string) => {
  if (item === none) return list.includes(none) ? [] : [none]
  return toggle(list.filter((x) => x !== none), item)
}

function pluralTimes(n: number) {
  return n >= 2 && n <= 4 ? 'тренировки' : 'тренировок'
}

type Props = { onExit: () => void; onDone: (profile: Profile) => void }

export function Onboarding({ onExit, onDone }: Props) {
  const [step, setStep] = useState(1)
  const [p, setP] = useState<Profile>(emptyProfile)
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setP((prev) => ({ ...prev, [key]: value }))

  const valid: Record<number, boolean> = {
    1: p.gender !== null && p.age !== null && p.height !== null && p.weight !== null,
    2: p.goal !== null,
    3: p.level !== null,
    4: p.place !== null,
    5: p.perWeek !== null && p.minutes !== null && (p.autoDays || p.days.length === p.perWeek),
    6: true,
  }
  const kbOpen = useKeyboardFit()

  const back = () => (step === 1 ? onExit() : setStep(step - 1))
  const next = () => {
    if (!valid[step]) return
    if (step === STEPS) onDone(p)
    else setStep(step + 1)
  }

  return (
    <main className={`ob${kbOpen ? ' kb-open' : ''}`}>
      <div className="ob__top">
        <button type="button" className="ob__back tappable" aria-label="Назад" onClick={back}>
          <ChevronLeftIcon />
        </button>
        <div className="ob__progress" aria-hidden>
          {Array.from({ length: STEPS }, (_, i) => (
            <i key={i} className={i < step ? 'on' : undefined} />
          ))}
        </div>
        <span className="ob__step">
          {step} из {STEPS}
        </span>
      </div>

      <div className="ob__scroll" key={step}>
        {step === 1 && <StepAbout p={p} set={set} />}
        {step === 2 && <StepGoal p={p} set={set} />}
        {step === 3 && <StepLevel p={p} set={set} />}
        {step === 4 && <StepPlace p={p} set={set} />}
        {step === 5 && <StepSchedule p={p} set={set} />}
        {step === 6 && <StepPriority p={p} set={set} />}
      </div>

      <div className="ob__bottom">
        {step === 5 && p.perWeek !== null && p.minutes !== null && (
          <p className="ob__hint">
            {p.perWeek} {pluralTimes(p.perWeek)} в неделю по {p.minutes} минут
          </p>
        )}
        <button type="button" className="ob__cta tappable" disabled={!valid[step]} onClick={next}>
          Далее
          <ArrowRightIcon />
        </button>
      </div>
    </main>
  )
}

type StepProps = { p: Profile; set: <K extends keyof Profile>(key: K, value: Profile[K]) => void }

function Head({ title, lead }: { title: string; lead: string }) {
  return (
    <>
      <h1 className="ob__title">{title}</h1>
      <p className="ob__lead">{lead}</p>
    </>
  )
}

function Option({ selected, onClick, icon, title, sub, className = '' }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; sub: string; className?: string }) {
  return (
    <button type="button" className={`ob-card ob-opt ${className}${selected ? ' sel' : ''}`} aria-pressed={selected} onClick={onClick}>
      {icon}
      <span className="ob-opt__text">
        <span className="ob-opt__title">{title}</span>
        <span className="ob-opt__sub">{sub}</span>
      </span>
      <span className="ob-radio" />
    </button>
  )
}

function Chip({ selected, onClick, children, className = '' }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" className={`ob-chip ${className}${selected ? ' sel' : ''}`} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  )
}

function StepAbout({ p, set }: StepProps) {
  const [picking, setPicking] = useState<NumKey | null>(null)
  const field = numFields.find((f) => f.key === picking)

  return (
    <>
      <Head title="О тебе" lead="Нужно, чтобы рассчитать нагрузку и стартовые веса под вас." />
      <div className="ob__body">
        <div className="ob-gender">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              className={`card ob-sel ob-g${p.gender === g ? ' sel' : ''}`}
              aria-pressed={p.gender === g}
              onClick={() => set('gender', g)}
            >
              <span className="ob-g__sym">{g === 'male' ? <MaleIcon /> : <FemaleIcon />}</span>
              <span className="ob-g__name">{g === 'male' ? 'Мужчина' : 'Женщина'}</span>
              <span className="ob-radio" />
            </button>
          ))}
        </div>
        <div className="ob-grid2">
          {numFields.map((f) => (
            <button key={f.key} type="button" className="card ob-num" onClick={() => setPicking(f.key)}>
              <span className="ob-num__k">{f.label}</span>
              <span className="ob-num__v">
                <span className={p[f.key] === null ? 'ob-num__empty' : undefined}>{p[f.key] ?? '—'}</span>
                <span className="ob-num__unit">{f.unit}</span>
              </span>
            </button>
          ))}
        </div>
        <p className="ob__label ob__label--center">Желаемый вес — необязательно</p>
      </div>
      <NumericWheelPicker
        open={field !== undefined}
        title={field?.label ?? ''}
        value={field ? (p[field.key] ?? field.start(p)) : 0}
        min={field?.min ?? 0}
        max={field?.max ?? 0}
        step={1}
        unit={field?.unit}
        onClose={() => setPicking(null)}
        onConfirm={(v) => {
          if (field) set(field.key, v)
          setPicking(null)
        }}
      />
    </>
  )
}

function StepGoal({ p, set }: StepProps) {
  return (
    <>
      <Head title="Твоя цель" lead="Выберите главную — под неё строится вся программа." />
      <div className="ob__body">
        {goals.map((g) => (
          <Option key={g.id} selected={p.goal === g.id} onClick={() => set('goal', g.id)} icon={<span className="ob-ibox">{g.icon}</span>} title={g.title} sub={g.sub} />
        ))}
      </div>
    </>
  )
}

function StepLevel({ p, set }: StepProps) {
  const [picking, setPicking] = useState<Lift | null>(null)
  const lift = lifts.find((l) => l.id === picking)

  return (
    <>
      <h1 className="ob__title ob__title--sm">Твой уровень</h1>
      <div className="ob-levels">
        {levels.map((l) => (
          <button key={l.id} type="button" className={`card ob-sel ob-level${p.level === l.id ? ' sel' : ''}`} aria-pressed={p.level === l.id} onClick={() => set('level', l.id)}>
            {p.level === l.id && (
              <span className="ob-level__check" aria-hidden>
                <CheckIcon />
              </span>
            )}
            <span className="ob-level__bars" aria-hidden>
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= l.bars ? 'on' : undefined} />
              ))}
            </span>
            <span className="ob-level__title">{l.title}</span>
            <span className="ob-level__sub">{l.sub}</span>
          </button>
        ))}
      </div>

      <section className="card ob-weights">
        <h2 className="ob-weights__title">Твои рабочие веса</h2>
        {lifts.map((l) => {
          const v = p.workingWeights[l.id]
          return (
            <button key={l.id} type="button" className="ob-weight" onClick={() => setPicking(l.id)}>
              <span className="ob-weight__tile">
                <img src={l.img} alt="" draggable={false} />
              </span>
              <span className="ob-weight__name">{l.title}</span>
              <span className="ob-weight__value">
                <span className={v === null ? 'ob-num__empty' : undefined}>{v ?? '—'}</span>
                <span className="ob-num__unit">кг</span>
                <ChevronRightIcon />
              </span>
            </button>
          )
        })}
      </section>

      <NumericWheelPicker
        open={lift !== undefined}
        title={lift?.title ?? ''}
        value={lift ? (p.workingWeights[lift.id] ?? lift.start) : 0}
        min={1}
        max={300}
        step={1}
        unit="кг"
        onClose={() => setPicking(null)}
        onConfirm={(v) => {
          if (lift) set('workingWeights', { ...p.workingWeights, [lift.id]: v })
          setPicking(null)
        }}
      />
    </>
  )
}

function StepPlace({ p, set }: StepProps) {
  return (
    <>
      <Head title="Как ты тренируешься?" lead="Подберём упражнения под ваше место и оборудование." />
      <div className="ob__body">
        <div className="ob-place">
          {places.map((pl) => (
            <button key={pl.id} type="button" className={`ob-card ob-pl${p.place === pl.id ? ' sel' : ''}`} aria-pressed={p.place === pl.id} onClick={() => set('place', pl.id)}>
              <span className="ob-ibox">{pl.icon}</span>
              <span className="ob-opt__title">{pl.title}</span>
              <span className="ob-opt__sub">{pl.sub}</span>
              <span className="ob-radio" />
            </button>
          ))}
        </div>
        {p.place === 'home_equipment' && (
          <>
            <p className="ob__label">Что есть дома?</p>
            <div className="ob-chips">
              {equipmentList.map((e) => (
                <Chip key={e} selected={p.equipment.includes(e)} onClick={() => set('equipment', toggle(p.equipment, e))}>
                  {e}
                </Chip>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function StepSchedule({ p, set }: StepProps) {
  const pickDay = (i: number) => {
    if (p.autoDays) return
    if (p.days.includes(i)) set('days', p.days.filter((d) => d !== i))
    else if (p.perWeek === null || p.days.length < p.perWeek) set('days', [...p.days, i].sort())
  }
  return (
    <>
      <Head title="Когда и сколько времени?" lead="Разложим тренировки и отдых по вашей неделе." />
      <div className="ob__body">
        <p className="ob__label ob__label--first">Сколько раз в неделю</p>
        <div className="ob-chips ob-chips--5">
          {[2, 3, 4, 5, 6].map((n) => (
            <Chip
              key={n}
              selected={p.perWeek === n}
              onClick={() => {
                set('perWeek', n)
                if (p.days.length > n) set('days', p.days.slice(0, n))
              }}
            >
              {n}
            </Chip>
          ))}
        </div>
        <p className="ob__label">
          В какие дни
          {!p.autoDays && p.perWeek !== null && (
            <small>
              {' '}
              — выбрано {p.days.length} из {p.perWeek}
            </small>
          )}
        </p>
        <div className="ob-card">
          <div className={`ob-days${p.autoDays ? ' is-off' : ''}`}>
            {weekDays.map((d, i) => {
              const on = p.days.includes(i)
              return (
                <button key={d} type="button" className={`ob-day${on ? ' on' : ''}`} aria-pressed={on} disabled={p.autoDays} onClick={() => pickDay(i)}>
                  {d}
                  <span className="ob-day__dot">{on && <CheckIcon />}</span>
                </button>
              )
            })}
          </div>
          <button
            type="button"
            className="ob-toggle"
            role="switch"
            aria-checked={p.autoDays}
            onClick={() => {
              set('autoDays', !p.autoDays)
              set('days', [])
            }}
          >
            <span>Подобрать дни за меня</span>
            <span className={`ob-switch${p.autoDays ? ' on' : ''}`} />
          </button>
        </div>
        <p className="ob__label">Время на одну тренировку</p>
        <div className="ob-chips ob-chips--4">
          {[30, 45, 60, 90].map((m) => (
            <Chip key={m} className="ob-chip--min" selected={p.minutes === m} onClick={() => set('minutes', m)}>
              {m}
              <small>мин</small>
            </Chip>
          ))}
        </div>
      </div>
    </>
  )
}

function StepPriority({ p, set }: StepProps) {
  return (
    <>
      <Head title="Приоритет и ограничения" lead="Что прокачать сильнее и что нужно беречь." />
      <div className="ob__body">
        <p className="ob__label ob__label--first">
          Приоритетные мышцы <small>— можно несколько</small>
        </p>
        <div className="ob-chips">
          {[...muscles, NO_PRIORITY].map((m) => (
            <Chip key={m} selected={p.priorities.includes(m)} onClick={() => set('priorities', toggleWithNone(p.priorities, m, NO_PRIORITY))}>
              {m}
            </Chip>
          ))}
        </div>
        <p className="ob__label">Травмы и ограничения</p>
        <div className="ob-chips">
          {[...limitList, NO_LIMITS].map((l) => (
            <Chip key={l} selected={p.limits.includes(l)} onClick={() => set('limits', toggleWithNone(p.limits, l, NO_LIMITS))}>
              {l}
            </Chip>
          ))}
        </div>
        <label className="ob-card ob-notes">
          <span className="ob-opt__title">Что-то ещё?</span>
          <textarea
            rows={2}
            maxLength={300}
            value={p.notes}
            placeholder="Например: «нельзя прыжки», «болит после бега»"
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>
      </div>
    </>
  )
}

const MaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="9.5" cy="14.5" r="6" />
    <path d="M13.8 10.2 20 4M14.5 4H20v5.5" />
  </svg>
)

const FemaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8.5" r="6" />
    <path d="M12 14.5V22M8.5 18.5h7" />
  </svg>
)

/**
 * Держит активное поле над клавиатурой iOS в Telegram Mini App.
 * Клавиатура уменьшает visualViewport: добавляем снизу отступ ровно на её высоту
 * и прокручиваем поле в видимую область. Возвращает, открыта ли клавиатура.
 */
function useKeyboardFit() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const vv = window.visualViewport
    const root = document.documentElement
    let blurTimer = 0

    const focused = () => {
      const el = document.activeElement as HTMLElement | null
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.closest('.ob') ? el : null
    }
    const reveal = () => {
      const el = focused()
      if (!el) return
      const card = (el.closest('.ob-card') as HTMLElement | null) ?? el
      card.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    const update = () => {
      const kb = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0
      root.style.setProperty('--kb', `${Math.round(kb)}px`)
      if (focused()) requestAnimationFrame(reveal)
    }
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement
      if (!(t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') || !t.closest('.ob')) return
      clearTimeout(blurTimer)
      setOpen(true)
      // клавиатура появляется с анимацией — проверяем после её завершения
      setTimeout(reveal, 60)
      setTimeout(update, 350)
    }
    const onFocusOut = () => {
      blurTimer = window.setTimeout(() => {
        if (!focused()) {
          setOpen(false)
          root.style.setProperty('--kb', '0px')
          window.scrollTo(0, 0)
        }
      }, 120)
    }

    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      clearTimeout(blurTimer)
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      root.style.setProperty('--kb', '0px')
    }
  }, [])

  return open
}
