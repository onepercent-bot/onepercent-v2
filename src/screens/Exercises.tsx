import { useEffect, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons'
import { MuscleIcon, type MuscleZone } from '../components/MuscleIcon'
import {
  byGroup,
  equipmentOf,
  groups,
  levelName,
  loadExercises,
  muscleName,
  posterUrl,
  videoUrl,
  type Exercise,
  type Group,
  type Place,
} from '../data/exercises'

// Раздел «Упражнения»: группа мышц → список → карточка с видео.
export function Exercises() {
  const [parent, setParent] = useState<Group | null>(null)
  const [group, setGroup] = useState<Group | null>(null)
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

function ExerciseCard({ exercise: e, onBack }: { exercise: Exercise; onBack: () => void }) {
  const muscles = [...new Set([e.target, ...e.secondary].map(muscleName))]
  return (
    <main className="ex">
      <header className="ex__bar">
        <Back onBack={onBack} />
      </header>
      {e.video && (
        <div
          className="ex__studio"
          style={{ aspectRatio: e.video.ar ?? 1, width: `min(100%, calc(62vh * ${e.video.ar ?? 1}))` }}
        >
          <video
            key={e.id}
            src={videoUrl(e)}
            poster={posterUrl(e)}
            autoPlay
            muted
            loop
            playsInline
            disablePictureInPicture
          />
        </div>
      )}
      <h1 className="ex__card-title">{e.name}</h1>
      <ul className="ex__tags">
        {muscles.map((m, i) => (
          <li key={m} className={`ex__tag${i === 0 ? ' is-main' : ''}`}>
            {m}
          </li>
        ))}
        <li className="ex__tag">{equipmentOf(e)}</li>
        <li className="ex__tag">{levelName(e.difficulty)}</li>
      </ul>
      <section className="card ex__steps" aria-label="Техника">
        <h2 className="ex__steps-title">Техника</h2>
        <ol>
          {e.steps.map((s, i) => (
            <li key={i}>
              <span className="ex__num">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
