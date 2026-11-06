import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ChevronLeftIcon,
  PauseIcon,
  PlayIcon,
  SwapIcon,
  TrendUpIcon,
} from '../components/Icons'
import { MuscleIcon, type MuscleZone } from '../components/MuscleIcon'
import { NumericWheelPicker } from '../components/NumericWheelPicker'
import { ExerciseCard } from './Exercises'
import { loadExercises, posterUrl, videoUrl, type Exercise } from '../data/exercises'
import { itemFor, todayIndex, weekPlan, type PlanDay, type PlanItem, type WeekPlan } from '../data/plan'
import { getWorkouts, saveWorkout, subscribeWorkouts, type SetLog } from '../data/workouts'
import { loadProfile, type Profile } from '../onboarding'

// «Тренировка дня»: план недели по анкете (src/data/plan.ts) → список упражнений → запись подходов.
// Базовые всегда первыми, изолирующие — добивка. Сохранение → saveWorkout() → «Прогресс» пересчитывается сам.

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const short: Record<string, string> = {
  'Грудь и трицепс': 'Грудь',
  'Спина и бицепс': 'Спина',
  Ноги: 'Ноги',
  'Ноги и пресс': 'Ноги',
  'Верх тела': 'Верх',
  'Всё тело': 'Всё тело',
}

const num = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace('.', ','))
const kg = (x: number) => `${num(x)} кг`
const zoneOf = (e: Exercise): MuscleZone =>
  e.target === 'biceps' ? 'biceps' : e.target === 'triceps' ? 'triceps' : e.target === 'forearms' ? 'forearms'
  : e.bodyPart === 'chest' ? 'chest' : e.bodyPart === 'back' || e.bodyPart === 'neck' ? 'back'
  : e.bodyPart === 'shoulders' ? 'shoulders' : e.bodyPart === 'waist' ? 'abs' : e.bodyPart === 'cardio' ? 'cardio' : 'legs'

const useWorkouts = () => useSyncExternalStore(subscribeWorkouts, getWorkouts, getWorkouts)

export function Workout({ onClose }: { onClose: () => void }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const profile = useMemo<Profile | null>(loadProfile, [])
  const history = useWorkouts()
  const [selected, setSelected] = useState(todayIndex())
  const [session, setSession] = useState<PlanDay | null>(null)

  useEffect(() => {
    loadExercises().then(() => setReady(true), () => setError(true))
  }, [])

  const plan = useMemo<WeekPlan | null>(() => (ready && profile ? weekPlan(profile, history) : null), [ready, profile, history])

  if (!profile) return <Empty onClose={onClose} text="Пройдите анкету — по ней соберём тренировки." />
  if (error) return <Empty onClose={onClose} text="Не удалось загрузить упражнения. Проверьте интернет и откройте снова." />
  if (!plan) return <Empty onClose={onClose} text="Собираем вашу тренировку…" />

  if (session) return <Session day={session} profile={profile} deload={plan.deload} onExit={() => setSession(null)} onDone={() => setSession(null)} />

  return <Day plan={plan} selected={selected} onSelect={setSelected} onStart={setSession} onClose={onClose} />
}

function Empty({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <main className="wo">
      <header className="wo-bar">
        <button type="button" className="wo-ic tappable" aria-label="Назад" onClick={onClose}>
          <ChevronLeftIcon />
        </button>
      </header>
      <p className="wo-empty">{text}</p>
    </main>
  )
}

/* ───────── тренировка дня ───────── */

function Day({ plan, selected, onSelect, onStart, onClose }: {
  plan: WeekPlan
  selected: number
  onSelect: (d: number) => void
  onStart: (d: PlanDay) => void
  onClose: () => void
}) {
  const history = useWorkouts()
  const today = todayIndex()
  const day = plan.days[selected]
  const doneDays = useMemo(() => {
    const now = new Date()
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - today).getTime()
    return new Set(history.filter((w) => Date.parse(w.date) >= monday).map((w) => todayIndex(new Date(w.date))))
  }, [history, today])
  const next = plan.days.findIndex((d, i) => d && i > today)
  const tip = day ? coachTip(day.items) : null
  const [open, setOpen] = useState<Exercise | null>(null)

  if (open) return <ExerciseCard exercise={open} onBack={() => setOpen(null)} />

  return (
    <main className="wo">
      <header className="wo-head">
        <button type="button" className="wo-ic tappable" aria-label="Назад" onClick={onClose}>
          <ChevronLeftIcon />
        </button>
        <p className="wo-eyebrow">
          НЕДЕЛЯ {plan.week} ИЗ 4{plan.deload ? ' · ЛЁГКАЯ' : ''}
        </p>
        <h1 className="wo-h1">{day ? day.title : 'День отдыха'}</h1>
        <p className="wo-meta">
          {day
            ? `${day.items.length} упражнений · ~${Math.round(day.items.reduce((s, it) => s + it.rx.sets * (it.rest / 60 + 1), 0) + 5)} мин`
            : next >= 0 ? `Следующая тренировка — ${DAYS[next]}` : 'Восстановление — тоже часть прогресса'}
        </p>
      </header>

      <div className="wo-body">
        <div className="card wo-week">
          {plan.days.map((d, i) => (
            <button
              key={i}
              type="button"
              className={`wo-d tappable${i === selected ? ' is-sel' : ''}${d ? '' : ' is-off'}`}
              onClick={() => onSelect(i)}
            >
              <b>{DAYS[i]}</b>
              <span className="wo-dot">{doneDays.has(i) && <CheckIcon />}</span>
              <small>{d ? short[d.title] ?? d.title : 'Отдых'}</small>
            </button>
          ))}
        </div>

        {tip && (
          <div className="card wo-coach">
            <span className="wo-disc"><BoltIcon /></span>
            <p>
              {tip[0]} <span>{tip[1]}</span>
            </p>
          </div>
        )}

        {day && (
          <ul className="wo-list">
            {day.items.map((it) => (
              <li key={it.exercise.id}>
                <button type="button" className="card wo-row tappable" onClick={() => setOpen(it.exercise)}>
                  <Thumb e={it.exercise} />
                  <span className="wo-rt">
                    <span className="wo-rn">{it.exercise.name}</span>
                    <span className="wo-rx">
                      {it.rx.sets} × {it.rx.min}–{it.rx.max}
                      {it.exercise.kind === 'base' ? ' · базовое' : ''}
                    </span>
                  </span>
                  <span className="wo-pill">
                    <b className={it.kg === null ? 'is-mute' : ''}>{it.kg !== null ? kg(it.kg) : it.bodyweight ? 'свой вес' : 'подбор'}</b>
                    {it.change && it.change !== 'подбор' && <i>{it.change}</i>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {day && selected === today && (
        <div className="wo-foot">
          <button type="button" className="cta tappable" onClick={() => onStart(day)}>
            {doneDays.has(today) ? 'Повторить тренировку' : 'Начать тренировку'}
            <ArrowRightIcon />
          </button>
        </div>
      )}
    </main>
  )
}

/** Одна короткая строка тренера: что изменилось сегодня. */
function coachTip(items: PlanItem[]): [string, string] | null {
  const up = items.find((it) => it.change.endsWith('кг'))
  if (up) return [`${up.exercise.name}: ${up.change}`, '— прошлый раз все подходы на верх диапазона']
  if (items.some((it) => it.change === 'подбор')) return ['Подберите вес', '— чтобы последние 1–2 повтора давались тяжело']
  const rep = items.find((it) => it.change === '+1 повтор')
  if (rep) return [`${rep.exercise.name}: +1 повтор`, '— вес тот же, добираем повторы']
  return null
}

function Thumb({ e }: { e: Exercise }) {
  const ar = e.video?.ar ?? 1
  const pos = e.video?.pos ?? 50
  return (
    <span className="wo-th">
      {e.video && (
        <img src={posterUrl(e)} alt="" loading="lazy" draggable={false} style={{ objectPosition: ar >= 1 ? `${pos}% 50%` : `50% ${pos}%` }} />
      )}
    </span>
  )
}

/** Видео упражнения: широкий кадр — на всю ширину, квадратный и вертикальный — квадрат с обрезкой вокруг человека (как плитка). */
function Studio({ e }: { e: Exercise }) {
  if (!e.video) return null
  const ar = e.video.ar ?? 1
  const wide = ar > 1.2
  const pos = e.video.pos ?? 50
  return (
    <div className={`wo-studio${wide ? ' is-wide' : ''}`} style={wide ? { aspectRatio: ar } : undefined}>
      <video
        key={e.id}
        src={videoUrl(e)}
        poster={posterUrl(e)}
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        style={{ objectPosition: ar >= 1 ? `${pos}% 50%` : `50% ${pos}%` }}
      />
    </div>
  )
}

/* ───────── выполнение ───────── */

type LogSet = { kg: number | null; reps: number | null; done: boolean }
type Picking = { set: number; field: 'kg' | 'reps' } | null

function Session({ day, profile, deload, onExit, onDone }: {
  day: PlanDay
  profile: Profile
  deload: boolean
  onExit: () => void
  onDone: () => void
}) {
  const [items, setItems] = useState(day.items)
  const [idx, setIdx] = useState(0)
  const [logs, setLogs] = useState<LogSet[][]>(() => day.items.map(fresh))
  const [picking, setPicking] = useState<Picking>(null)
  const [finished, setFinished] = useState(false)
  const rest = useRest()

  const it = items[idx]
  const sets = logs[idx]
  const cur = sets.findIndex((s) => !s.done)
  const allDone = cur === -1
  const last = idx === items.length - 1

  const setField = (si: number, field: 'kg' | 'reps', v: number) =>
    setLogs((L) => L.map((row, r) => (r !== idx ? row : row.map((s, i) => (i === si ? { ...s, [field]: v } : field === 'kg' && i > si && !s.done ? { ...s, kg: v } : s)))))

  const complete = (si: number) => {
    setLogs((L) => L.map((row, r) => (r !== idx ? row : row.map((s, i) => (i === si ? { ...s, done: true } : s)))))
    if (si < sets.length - 1) rest.start(it.rest)
  }

  const onMain = () => {
    if (allDone) {
      if (!last) {
        rest.stop()
        setIdx(idx + 1)
        return
      }
      finish()
      return
    }
    const s = sets[cur]
    if (!it.bodyweight && s.kg === null) return setPicking({ set: cur, field: 'kg' })
    if (s.reps === null) return setPicking({ set: cur, field: 'reps' })
    complete(cur)
  }

  const replace = () => {
    const nextEx = it.alts[0]
    if (!nextEx) return
    const ni = itemFor(nextEx, [...it.alts.slice(1), it.exercise], profile, deload)
    setItems((I) => I.map((x, i) => (i === idx ? ni : x)))
    setLogs((L) => L.map((row, i) => (i === idx ? fresh(ni) : row)))
  }

  const finish = () => {
    const exercises = items
      .map((x, i) => ({
        exerciseId: x.exercise.id,
        name: x.exercise.name,
        bodyPart: x.exercise.bodyPart,
        target: x.exercise.target,
        sets: logs[i].filter((s) => s.done && s.reps !== null).map<SetLog>((s) => ({ weight: s.kg ?? 0, reps: s.reps ?? 0 })),
      }))
      .filter((x) => x.sets.length)
    if (exercises.length) saveWorkout({ id: `w${Date.now()}`, date: new Date().toISOString(), exercises })
    rest.stop()
    setFinished(true)
  }

  if (finished) {
    const total = logs.flat().filter((s) => s.done).length
    return (
      <main className="wo">
        <div className="wo-finish">
          <span className="wo-disc wo-disc--lg"><CheckIcon /></span>
          <h1 className="wo-h1">Тренировка сохранена</h1>
          <p className="wo-meta">{total} подходов · {day.title}</p>
          <p className="wo-meta">В следующий раз веса подстроятся под сегодняшний результат.</p>
          <button type="button" className="cta tappable" onClick={onDone}>
            Готово
          </button>
        </div>
      </main>
    )
  }

  const prev = it.prev
  const pick = picking ? sets[picking.set] : null
  const step = ['dumbbell', 'kettlebell'].includes(it.exercise.equipment) ? 1 : 2.5

  return (
    <main className="wo">
      <header className="wo-bar">
        <button type="button" className="wo-ic tappable" aria-label="Назад" onClick={() => (idx > 0 ? setIdx(idx - 1) : onExit())}>
          <ChevronLeftIcon />
        </button>
        <span className="wo-bar__t">
          Упражнение {idx + 1} из {items.length}
        </span>
        <button type="button" className="wo-ic wo-ic--txt tappable" onClick={finish}>
          Завершить
        </button>
      </header>

      <div className="wo-body wo-body--s">
        <Studio e={it.exercise} />
        <div className="wo-tline">
          <div>
            <h1 className="wo-tl">{it.exercise.name}</h1>
            <p className="wo-meta">
              {it.rx.sets} × {it.rx.min}–{it.rx.max} повторений
            </p>
          </div>
          <MuscleIcon zone={zoneOf(it.exercise)} className="wo-mus" />
        </div>

        <div className="card wo-prog">
          <span className="wo-disc"><TrendUpIcon /></span>
          {prev ? (
            <p>
              Было <b>{prev}</b> · сегодня <b>{it.kg !== null ? kg(it.kg) : it.bodyweight ? 'свой вес' : 'подбор'}</b> {it.change && <em>{it.change}</em>}
            </p>
          ) : (
            <p>
              {it.bodyweight ? <><b>Свой вес</b> — чисто, без рывков</> : <><b>Подберите вес</b> — последние 1–2 повтора тяжело</>}
            </p>
          )}
        </div>

        <div className="card wo-sets">
          <div className="wo-sh">
            <span />
            <span>Подход</span>
            <span>Вес, кг</span>
            <span>Повторы</span>
            <span />
          </div>
          {sets.map((s, i) => {
            const isCur = i === cur
            return (
              <div key={i} className={`wo-sr${s.done ? ' is-done' : ''}${isCur ? ' is-cur' : ''}`}>
                <span className={`wo-st${isCur ? ' is-cur' : ''}`}>{s.done && <CheckIcon />}</span>
                <span className="wo-n">{i + 1}</span>
                {it.bodyweight ? (
                  <span className="wo-box is-static">свой</span>
                ) : (
                  <button type="button" className={`wo-box${isCur ? ' is-act' : ''}${s.kg === null ? ' is-emp' : ''}`} disabled={s.done} onClick={() => setPicking({ set: i, field: 'kg' })}>
                    {s.kg !== null ? num(s.kg) : '—'}
                  </button>
                )}
                <button type="button" className={`wo-box${s.reps === null ? ' is-emp' : ''}`} disabled={s.done} onClick={() => setPicking({ set: i, field: 'reps' })}>
                  {s.reps ?? `${it.rx.min}–${it.rx.max}`}
                </button>
                <button
                  type="button"
                  className={`wo-ck tappable${s.done ? ' is-on' : ''}`}
                  aria-label="Подход выполнен"
                  disabled={s.done || !isCur}
                  onClick={() => (s.reps === null ? setPicking({ set: i, field: 'reps' }) : complete(i))}
                >
                  <CheckIcon />
                </button>
              </div>
            )
          })}
        </div>

        {rest.left > 0 && (
          <div className="card wo-rest">
            <svg className="wo-ring" viewBox="0 0 48 48" aria-hidden>
              <circle cx="24" cy="24" r="20" className="wo-ring__bg" />
              <circle cx="24" cy="24" r="20" className="wo-ring__fg" strokeDasharray="125.7" strokeDashoffset={125.7 * (1 - rest.left / rest.total)} transform="rotate(-90 24 24)" />
            </svg>
            <span className="wo-rest__t">
              <b>Отдых</b>
              <span>
                {clock(rest.left)} <small>/ {clock(rest.total)}</small>
              </span>
            </span>
            <button type="button" className="wo-sq tappable" aria-label={rest.paused ? 'Продолжить' : 'Пауза'} onClick={rest.toggle}>
              {rest.paused ? <PlayIcon /> : <PauseIcon />}
            </button>
            <button type="button" className="wo-sq tappable" onClick={() => rest.add(30)}>
              +30 с
            </button>
          </div>
        )}
      </div>

      <div className="wo-foot">
        {!allDone && it.alts.length > 0 && sets.every((s) => !s.done) && (
          <button type="button" className="wo-ghost tappable" onClick={replace}>
            <SwapIcon />
            Заменить
          </button>
        )}
        <button type="button" className="cta tappable" onClick={onMain}>
          {allDone ? (last ? 'Завершить тренировку' : 'Следующее упражнение') : 'Подход выполнен'}
          {allDone ? <ArrowRightIcon /> : <CheckIcon />}
        </button>
      </div>

      <NumericWheelPicker
        open={picking !== null}
        title={picking?.field === 'kg' ? 'Вес, кг' : 'Повторения'}
        value={picking?.field === 'kg' ? (pick?.kg ?? it.kg ?? 20) : (pick?.reps ?? it.rx.max)}
        min={picking?.field === 'kg' ? 0 : 1}
        max={picking?.field === 'kg' ? 300 : 50}
        step={picking?.field === 'kg' ? step : 1}
        unit={picking?.field === 'kg' ? 'кг' : undefined}
        onClose={() => setPicking(null)}
        onConfirm={(v) => {
          if (picking) {
            setField(picking.set, picking.field, v)
            // ввели повторы текущего подхода — сразу засчитываем его
            const s = sets[picking.set]
            if (picking.field === 'reps' && picking.set === cur && (it.bodyweight || s.kg !== null)) complete(picking.set)
          }
          setPicking(null)
        }}
      />
    </main>
  )
}

const fresh = (it: PlanItem): LogSet[] => Array.from({ length: it.rx.sets }, () => ({ kg: it.bodyweight ? null : it.kg, reps: null, done: false }))
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function useRest() {
  const [total, setTotal] = useState(0)
  const [left, setLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => {
    window.clearInterval(timer.current)
    if (left <= 0 || paused) return
    timer.current = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => window.clearInterval(timer.current)
  }, [left > 0, paused]) // eslint-disable-line react-hooks/exhaustive-deps
  return {
    total,
    left,
    paused,
    start: (s: number) => {
      setTotal(s)
      setLeft(s)
      setPaused(false)
    },
    stop: () => setLeft(0),
    toggle: () => setPaused((p) => !p),
    add: (s: number) => {
      setTotal((t) => t + s)
      setLeft((l) => l + s)
    },
  }
}
