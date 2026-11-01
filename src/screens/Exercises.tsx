import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/Icons'
import {
  byGroup,
  equipmentName,
  groups,
  levelName,
  muscleName,
  posterUrl,
  videoUrl,
  type Exercise,
  type Group,
} from '../data/exercises'

// Раздел «Упражнения»: группа мышц → список → карточка с видео.
export function Exercises() {
  const [group, setGroup] = useState<Group | null>(null)
  const [exercise, setExercise] = useState<Exercise | null>(null)

  if (exercise) return <ExerciseCard exercise={exercise} onBack={() => setExercise(null)} />
  if (group) return <ExerciseList group={group} onBack={() => setGroup(null)} onOpen={setExercise} />

  return (
    <main className="ex">
      <header className="ex__head">
        <h1 className="ex__title">Упражнения</h1>
        <p className="ex__sub">Выберите группу мышц</p>
      </header>
      <ul className="ex__groups">
        {groups.map((g) => (
          <li key={g.id}>
            <button type="button" className="card ex__group tappable" onClick={() => setGroup(g)}>
              <span className="ex__group-name">{g.name}</span>
              <span className="ex__group-count">{byGroup(g).length}</span>
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
] as const

function ExerciseList({ group, onBack, onOpen }: { group: Group; onBack: () => void; onOpen: (e: Exercise) => void }) {
  const [place, setPlace] = useState<Exercise['place']>('gym')
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
            <button type="button" className="card ex__row tappable" onClick={() => onOpen(e)}>
              <span className="ex__thumb">
                {e.video && <img src={posterUrl(e)} alt="" loading="lazy" draggable={false} />}
              </span>
              <span className="ex__text">
                <span className="ex__name">{e.name}</span>
                <span className="ex__meta">
                  {equipmentName(e.equipment)} • {levelName(e.difficulty)}
                </span>
              </span>
              <ChevronRightIcon className="ex__go" />
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

function ExerciseCard({ exercise: e, onBack }: { exercise: Exercise; onBack: () => void }) {
  const muscles = [...new Set([e.target, ...e.secondary].map(muscleName))]
  return (
    <main className="ex">
      <header className="ex__bar">
        <Back onBack={onBack} />
      </header>
      <div className="ex__studio">
        {e.video && (
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
        )}
      </div>
      <h1 className="ex__card-title">{e.name}</h1>
      <ul className="ex__tags">
        {muscles.map((m, i) => (
          <li key={m} className={`ex__tag${i === 0 ? ' is-main' : ''}`}>
            {m}
          </li>
        ))}
        <li className="ex__tag">{equipmentName(e.equipment)}</li>
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
