import { useState, type ReactNode } from 'react'
import artImg from '../../assets/welcome-art.webp'
import {
  ArrowRightIcon,
  BodyIcon,
  BoltIcon,
  CheckIcon,
  ChevronLeftIcon,
  DumbbellIcon,
  FlameIcon,
  GymIcon,
  HeartIcon,
  PullUpBarIcon,
  PulseIcon,
} from '../../components/Icons'
import { emptyProfile, type Goal, type Level, type Place, type Profile } from '../../onboarding'

const STEPS = 6

const goals: { id: Goal; title: string; sub: string; icon: ReactNode }[] = [
  { id: 'muscle', title: 'Набрать мышечную массу', sub: 'Больше мышц и объёма', icon: <DumbbellIcon className="ob-i-dumbbell" /> },
  { id: 'fat_loss', title: 'Похудеть и подтянуть тело', sub: 'Меньше жира, плотнее мышцы', icon: <FlameIcon /> },
  { id: 'strength', title: 'Стать сильнее', sub: 'Рост рабочих весов', icon: <BoltIcon className="ob-i-bolt" /> },
  { id: 'definition', title: 'Рельеф и выносливость', sub: 'Сухое тело и запас сил', icon: <PulseIcon /> },
  { id: 'maintain', title: 'Поддерживать форму', sub: 'Здоровье и тонус', icon: <HeartIcon /> },
]

const levels: { id: Level; title: string; sub: string; bars: number }[] = [
  { id: 'beginner', title: 'Новичок', sub: 'Не тренировался или меньше 6 месяцев', bars: 1 },
  { id: 'intermediate', title: 'Средний', sub: 'Регулярно от 6 месяцев до 2 лет', bars: 2 },
  { id: 'advanced', title: 'Продвинутый', sub: 'Регулярно больше 2 лет', bars: 3 },
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

const inRange = (v: string, min: number, max: number) => {
  const n = Number(v.replace(',', '.'))
  return v !== '' && Number.isFinite(n) && n >= min && n <= max
}

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
    1: p.gender !== null && inRange(p.age, 14, 80) && inRange(p.height, 120, 230) && inRange(p.weight, 35, 250) && (p.targetWeight === '' || inRange(p.targetWeight, 35, 250)),
    2: p.goal !== null,
    3: p.level !== null && (p.benchUnknown || p.bench === '' || inRange(p.bench, 0, 400)),
    4: p.place !== null,
    5: p.perWeek !== null && p.minutes !== null && (p.autoDays || p.days.length === p.perWeek),
    6: true,
  }

  const back = () => (step === 1 ? onExit() : setStep(step - 1))
  const next = () => {
    if (!valid[step]) return
    if (step === STEPS) onDone(p)
    else setStep(step + 1)
  }

  return (
    <main className="ob">
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
          {step === STEPS ? 'Составить мой план' : 'Далее'}
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

function NumField({ label, unit, value, onChange, placeholder = '—' }: { label: string; unit: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="ob-card ob-num">
      <span className="ob-num__k">{label}</span>
      <span className="ob-num__v">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          maxLength={5}
          value={value}
          placeholder={placeholder}
          style={{ width: `${Math.max(value.length, 1) + 0.4}ch` }}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
        />
        <span className="ob-num__unit">{unit}</span>
      </span>
    </label>
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
  return (
    <>
      <Head title="О тебе" lead="Нужно, чтобы рассчитать нагрузку и стартовые веса под вас." />
      <div className="ob__body">
        <div className="ob-gender">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              className={`ob-card ob-g ob-g--${g}${p.gender === g ? ' sel' : ''}${p.gender && p.gender !== g ? ' dim' : ''}`}
              aria-pressed={p.gender === g}
              onClick={() => set('gender', g)}
            >
              <img src={artImg} alt="" draggable={false} />
              <span className="ob-g__name">{g === 'male' ? 'Мужчина' : 'Женщина'}</span>
              <span className="ob-radio" />
            </button>
          ))}
        </div>
        <div className="ob-grid2">
          <NumField label="Возраст" unit="лет" value={p.age} onChange={(v) => set('age', v)} />
          <NumField label="Рост" unit="см" value={p.height} onChange={(v) => set('height', v)} />
          <NumField label="Вес" unit="кг" value={p.weight} onChange={(v) => set('weight', v)} />
          <NumField label="Желаемый вес" unit="кг" value={p.targetWeight} onChange={(v) => set('targetWeight', v)} placeholder="—" />
        </div>
        <p className="ob__label ob__label--center">Желаемый вес — необязательно</p>
      </div>
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
  return (
    <>
      <Head title="Твой уровень" lead="От этого зависят упражнения, объём и стартовые веса." />
      <div className="ob__body">
        {levels.map((l) => (
          <Option
            key={l.id}
            className="ob-lvl"
            selected={p.level === l.id}
            onClick={() => set('level', l.id)}
            icon={
              <span className="ob-bars" aria-hidden>
                {[1, 2, 3].map((n) => (
                  <i key={n} className={n <= l.bars ? 'on' : undefined} />
                ))}
              </span>
            }
            title={l.title}
            sub={l.sub}
          />
        ))}
        <p className="ob__label">
          Сколько жмёте лёжа на 1 раз? <small>— необязательно</small>
        </p>
        <div className="ob-grid2">
          <NumField
            label="Жим лёжа"
            unit="кг"
            value={p.benchUnknown ? '' : p.bench}
            onChange={(v) => {
              set('bench', v)
              set('benchUnknown', false)
            }}
          />
          <button
            type="button"
            className={`ob-card ob-unknown${p.benchUnknown ? ' sel' : ''}`}
            aria-pressed={p.benchUnknown}
            onClick={() => {
              set('benchUnknown', !p.benchUnknown)
              set('bench', '')
            }}
          >
            Не знаю
          </button>
        </div>
      </div>
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
