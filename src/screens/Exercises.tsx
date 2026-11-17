import { useEffect, useMemo, useState } from 'react'
import { BarsIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ClockIcon, PulseIcon } from '../components/Icons'
import { MuscleIcon, type MuscleZone } from '../components/MuscleIcon'
import {
  byGroup,
  equipmentOf,
  groups,
  levelName,
  loadExercises,
  musclesOf,
  kindName,
  posterUrl,
  videoUrl,
  type Exercise,
  type Group,
  type Place,
} from '../data/exercises'
import { itemFor } from '../data/plan'
import { loadProfile } from '../onboarding'

// Раздел «Упражнения»: группа мышц → список → карточка с видео.
export function Exercises({ initialGroup }: { initialGroup?: string }) {
  const start = groups.find((g) => g.id === initialGroup) ?? null
  const [parent, setParent] = useState<Group | null>(start?.subs ? start : null)
  const [group, setGroup] = useState<Group | null>(start && !start.subs ? start : null)
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    loadExercises().then(
      () => setStatus('ready'),
      () => setStatus('error'),
    )
  }, [])

  if (exercise) return <ExerciseCard exercise={exercise} onBack={() => setExercise(null)} />
  if (group) return <ExerciseList group={group} onBack={() => setGroup(null)} onOpen={setExercise} />
  if (parent) return <GroupPicker title={parent.name} items={parent.subs!} onBack={() => setParent(null)} onPick={setGroup} />

  return (
    <GroupPicker
      title="Упражнения"
      sub={status === 'loading' ? 'Загружаем упражнения…' : status === 'error' ? 'Не удалось загрузить. Проверьте интернет' : 'Выберите группу мышц'}
      items={groups}
      disabled={status !== 'ready'}
      onPick={(g) => (g.subs ? setParent(g) : setGroup(g))}
    />
  )
}

function GroupPicker({ title, sub = 'Выберите мышцу', items, disabled = false, onBack, onPick }: {
  title: string
  sub?: string
  items: Group[]
  disabled?: boolean
  onBack?: () => void
  onPick: (g: Group) => void
}) {

  return (
    <main className="ex">
      <header className={onBack ? 'ex__bar' : 'ex__head'}>
        {onBack && <Back onBack={onBack} />}
        <div>
          <h1 className="ex__title">{title}</h1>
          <p className="ex__sub">{sub}</p>
        </div>
      </header>
      <ul className="ex__groups">
        {items.map((g, i) => (
          <li key={g.id} className={items.length % 2 && i === items.length - 1 ? 'is-wide' : undefined}>
            <button type="button" className="card ex__group tappable" disabled={disabled} onClick={() => onPick(g)}>
              <MuscleIcon zone={g.id as MuscleZone} className="ex__icon" />
              <span className="ex__group-text">
                <span className="ex__group-name">{g.name}</span>
                <span className="ex__group-count">{disabled ? ' ' : byGroup(g).length}</span>
              </span>
              <ChevronRightIcon className="ex__go" />
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className="ex__back tappable" aria-label="Назад" onClick={onBack}>
      <ChevronLeftIcon />
    </button>
  )
}

const places = [
  { id: 'gym', name: 'Зал' },
  { id: 'home', name: 'Дом' },
  { id: 'none', name: 'Без инвентаря' },
] as const

function ExerciseList({ group, onBack, onOpen }: { group: Group; onBack: () => void; onOpen: (e: Exercise) => void }) {
  const [place, setPlace] = useState<Place>('gym')
  const list = byGroup(group, place)
  return (
    <main className="ex">
      <header className="ex__bar">
        <Back onBack={onBack} />
        <div>
          <h1 className="ex__title">{group.name}</h1>
          <p className="ex__sub">{list.length} упражнений</p>
        </div>
      </header>
      <div className="ex__seg" role="tablist" aria-label="Где тренируетесь">
        {places.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={place === p.id}
            className={`ex__seg-btn tappable${place === p.id ? ' is-on' : ''}`}
            onClick={() => setPlace(p.id)}
          >
            {p.name} <span>{byGroup(group, p.id).length}</span>
          </button>
        ))}
      </div>
      <ul className="ex__list">
        {list.map((e) => (
          <li key={e.id}>
            <button type="button" className="card ex__tile tappable" onClick={() => onOpen(e)}>
              <Thumb e={e} />
              <span className="ex__text">
                <span className="ex__name">{e.name}</span>
                <span className="ex__meta">
                  {equipmentOf(e)} • {levelName(e.difficulty)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

/** Плитка: квадрат, кадр без искажений обрезан по длинной стороне вокруг человека (video.pos).
 *  Срезана и тонкая тёмная рамка исходника (1%). В карточке видео показываем целиком. */
function Thumb({ e }: { e: Exercise }) {
  const ar = e.video?.ar ?? 1
  const pos = e.video?.pos ?? 50
  return (
    <span className="ex__thumb">
      {e.video && (
        <img
          src={posterUrl(e)}
          alt=""
          loading="lazy"
          draggable={false}
          style={{ objectPosition: ar >= 1 ? `${pos}% 50%` : `50% ${pos}%` }}
        />
      )}
    </span>
  )
}

// Основная мышца и одна помогающая — человек сразу видит, что работает сильнее.
const loadRole = ['Основная', 'Помогает']

export function ExerciseCard({ exercise: e, onBack }: { exercise: Exercise; onBack: () => void }) {
  const muscles = musclesOf(e)
  const profile = useMemo(loadProfile, [])
  const item = useMemo(() => (profile ? itemFor(e, [], profile, false) : null), [e, profile])
  const [open, setOpen] = useState<'tech' | 'mus' | null>(null)
  const ar = e.video?.ar ?? 1
  const toggle = (k: 'tech' | 'mus') => setOpen((o) => (o === k ? null : k))

  return (
    <main className="ex">
      <header className="ex__bar">
        <Back onBack={onBack} />
      </header>
      {e.video && (
        <div className="ex__studio" style={{ aspectRatio: ar, width: `min(100%, calc(44vh * ${ar}))` }}>
          <video key={e.id} src={videoUrl(e)} poster={posterUrl(e)} autoPlay muted loop playsInline disablePictureInPicture />
        </div>
      )}
      <h1 className="ex__card-title">{e.name}</h1>
      <p className="ex__card-meta">
        {kindName(e.kind)} · {equipmentOf(e)} · {levelName(e.difficulty)}
      </p>

      {item && (
        <section className="card ex__params" aria-label="Параметры тренировки">
          <h2 className="ex__acc-title">Параметры тренировки</h2>
          <div className="ex__params-row">
            <span>
              <BarsIcon />
              <b>{item.rx.sets}</b> подхода
            </span>
            <span>
              <PulseIcon />
              <b>
                {item.rx.min}–{item.rx.max}
              </b>{' '}
              повторений
            </span>
            <span>
              <ClockIcon />
              <b>{item.rest} сек</b> отдых
            </span>
          </div>
        </section>
      )}

      <section className="card ex__acc">
        <button type="button" className="ex__acc-head tappable" aria-expanded={open === 'tech'} onClick={() => toggle('tech')}>
          <span className="ex__acc-title">Техника</span>
          <ChevronDownIcon className={open === 'tech' ? 'is-open' : undefined} />
        </button>
        <div className={`ex__acc-body${open === 'tech' ? ' is-open' : ''}`}>
          <div>
            <ol className="ex__steps-list">
              {e.steps.map((s, i) => (
                <li key={i}>
                  <span className="ex__num">{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="card ex__acc">
        <button type="button" className="ex__acc-head tappable" aria-expanded={open === 'mus'} onClick={() => toggle('mus')}>
          <span className="ex__acc-title">Какие мышцы работают</span>
          <ChevronDownIcon className={open === 'mus' ? 'is-open' : undefined} />
        </button>
        <div className={`ex__acc-body${open === 'mus' ? ' is-open' : ''}`}>
          <div>
            <div className="ex__mus">
              {muscles.map((m, i) => (
                <div key={m} className={`ex__mus-row${i === 0 ? ' is-main' : ''}`}>
                  <span className="ex__mus-name">{m}</span>
                  <span className="ex__mus-bar" aria-hidden>
                    {[0, 1].map((k) => (
                      <i key={k} className={k < 2 - i ? 'on' : undefined} />
                    ))}
                  </span>
                  <span className="ex__mus-role">{loadRole[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {item && (
        <section className="card ex__prev">
          <span className="ex__prev-k">В прошлый раз</span>
          <b className="ex__prev-v">{item.prev || 'ещё не выполняли'}</b>
        </section>
      )}
    </main>
  )
}
