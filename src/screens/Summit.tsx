import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import bgImg from '../assets/summit-bg.webp'
import { ArrowRightIcon, DumbbellIcon } from '../components/Icons'

/* Экран горы после анкеты. Координаты — в пикселях фонового изображения (851×1848). */
const ART_W = 851
const ART_H = 1848

/** Маршрут снизу вверх; последняя точка — вершина. */
const ROUTE: [number, number][] = [
  [150, 1135],
  [233, 1100],
  [312, 1058],
  [392, 1020],
  [440, 982],
  [450, 960],
  [350, 852],
  [510, 733],
  [442, 633],
  [553, 517],
  [480, 442],
]

type Checkpoint = { at: [number, number]; side: 'left' | 'right'; box: [number, number, number, number]; label: string[]; icon: 'user' | 'target' | 'calendar' | 'dumbbell' }

const CHECKPOINTS: Checkpoint[] = [
  { at: [450, 960], side: 'left', box: [97, 895, 276, 97], label: ['Твои данные'], icon: 'user' },
  { at: [510, 733], side: 'right', box: [520, 735, 203, 93], label: ['Цели'], icon: 'target' },
  { at: [442, 633], side: 'left', box: [153, 578, 267, 95], label: ['Режим', 'и расписание'], icon: 'calendar' },
  { at: [480, 442], side: 'right', box: [498, 362, 237, 93], label: ['Готовый', 'план'], icon: 'dumbbell' },
]

const START_DELAY = 150
const CLIMB_MS = 2800
const FLAG_DELAY = 140
const TITLE_AT = 3200
const CTA_AT = 3350

const pathD = 'M' + ROUTE.map(([x, y]) => `${x} ${y}`).join(' L')

/** Длина маршрута до каждой точки ломаной (совпадает с getTotalLength для прямых отрезков). */
function cumulative() {
  const acc = [0]
  for (let i = 1; i < ROUTE.length; i++) {
    const [x0, y0] = ROUTE[i - 1]
    const [x1, y1] = ROUTE[i]
    acc.push(acc[i - 1] + Math.hypot(x1 - x0, y1 - y0))
  }
  return acc
}

export function Summit({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const haloRef = useRef<SVGPathElement>(null)
  const tipRef = useRef<SVGCircleElement>(null)
  const [reached, setReached] = useState<boolean[]>(() => CHECKPOINTS.map(() => false))
  const [flag, setFlag] = useState(false)
  const [title, setTitle] = useState(false)
  const [cta, setCta] = useState(false)

  // сцена масштабируется как object-fit: cover, по центру
  useLayoutEffect(() => {
    const fit = () => {
      const root = rootRef.current
      const stage = stageRef.current
      if (!root || !stage) return
      const w = root.clientWidth
      const h = root.clientHeight
      const s = Math.max(w / ART_W, h / ART_H)
      stage.style.transform = `translate(${(w - ART_W * s) / 2}px, ${(h - ART_H * s) / 2}px) scale(${s})`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const glow = glowRef.current
    const halo = haloRef.current
    const tip = tipRef.current
    if (!glow || !halo || !tip) return

    const total = glow.getTotalLength()
    const cum = cumulative()
    const cpLen = CHECKPOINTS.map((c) => cum[ROUTE.findIndex(([x, y]) => x === c.at[0] && y === c.at[1])])
    for (const el of [glow, halo]) {
      el.style.strokeDasharray = `${total} ${total}`
      el.style.strokeDashoffset = `${total}`
    }

    const timers: number[] = []
    const finish = (immediate: boolean) => {
      timers.push(window.setTimeout(() => setFlag(true), immediate ? 0 : FLAG_DELAY))
      timers.push(window.setTimeout(() => setTitle(true), immediate ? 0 : TITLE_AT - START_DELAY - CLIMB_MS))
      timers.push(window.setTimeout(() => setCta(true), immediate ? 0 : CTA_AT - START_DELAY - CLIMB_MS))
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      glow.style.strokeDashoffset = '0'
      halo.style.strokeDashoffset = '0'
      setReached(CHECKPOINTS.map(() => true))
      finish(true)
      return () => timers.forEach(clearTimeout)
    }

    let raf = 0
    let start = 0
    let lit = 0
    const frame = (now: number) => {
      if (!start) start = now
      // равномерно по длине маршрута: линейно, без easing
      const k = Math.min(1, Math.max(0, (now - start - START_DELAY) / CLIMB_MS))
      const len = total * k
      glow.style.strokeDashoffset = `${total - len}`
      halo.style.strokeDashoffset = `${total - len}`
      const pt = glow.getPointAtLength(len)
      tip.setAttribute('cx', `${pt.x}`)
      tip.setAttribute('cy', `${pt.y}`)
      tip.style.opacity = k > 0 && k < 1 ? '1' : '0'

      let n = lit
      while (n < cpLen.length && len >= cpLen[n] - 0.5) n++
      if (n !== lit) {
        lit = n
        setReached(CHECKPOINTS.map((_, i) => i < n))
      }

      if (k < 1) raf = requestAnimationFrame(frame)
      else finish(false)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <main className={`summit${flag ? ' is-flag' : ''}`} ref={rootRef}>
      <div className="summit__stage" ref={stageRef}>
        <img className="summit__bg" src={bgImg} alt="" width={ART_W} height={ART_H} draggable={false} />
        <svg className="summit__svg" viewBox={`0 0 ${ART_W} ${ART_H}`} width={ART_W} height={ART_H} aria-hidden>
          <defs>
            <filter id="summit-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <radialGradient id="summit-dot-on">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.6" />
            </radialGradient>
            <radialGradient id="summit-tip">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="var(--accent)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* флаг: до вершины без свечения */}
          <g className="summit__flag">
            <path className="summit__flag-glow" d="M483 286 C500 279 520 297 546 291 L540 330 C516 336 500 320 483 326 Z" filter="url(#summit-blur)" />
            <line className="summit__pole" x1="480" y1="262" x2="480" y2="442" />
            <path className="summit__cloth" d="M483 286 C500 279 520 297 546 291 L540 330 C516 336 500 320 483 326 Z" />
          </g>

          {/* тёмный маршрут впереди */}
          <path className="summit__trail" d={pathD} />
          {/* пройденная часть: мягкое свечение + линия */}
          <path className="summit__halo" ref={haloRef} d={pathD} filter="url(#summit-blur)" />
          <path className="summit__line" ref={glowRef} d={pathD} />

          {CHECKPOINTS.map((c, i) => (
            <g key={c.label.join(' ')} className={`summit__dot${reached[i] ? ' is-on' : ''}`}>
              <circle className="summit__dot-glow" cx={c.at[0]} cy={c.at[1]} r="26" filter="url(#summit-blur)" />
              <circle className="summit__dot-core" cx={c.at[0]} cy={c.at[1]} r="15" />
            </g>
          ))}

          <circle className="summit__tip" ref={tipRef} cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="12" fill="url(#summit-tip)" />
        </svg>

        {CHECKPOINTS.map((c, i) => (
          <div
            key={c.label.join(' ')}
            className={`summit__card summit__card--${c.side}${reached[i] ? ' is-on' : ''}`}
            style={{ left: c.box[0], top: c.box[1], width: c.box[2], height: c.box[3] }}
          >
            <CardIcon kind={c.icon} />
            <span className="summit__card-text">
              {c.label.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </span>
          </div>
        ))}
      </div>

      <div className="summit__bottom">
        <h1 className={`summit__title${title ? ' is-on' : ''}`}>Первый шаг сделан</h1>
        <button type="button" className={`cta summit__cta tappable${cta ? ' is-on' : ''}`} onClick={onDone} disabled={!cta} tabIndex={cta ? 0 : -1}>
          Перейти на главную
          <ArrowRightIcon />
        </button>
      </div>
    </main>
  )
}

function CardIcon({ kind }: { kind: Checkpoint['icon'] }) {
  if (kind === 'dumbbell') return <DumbbellIcon className="summit__icon summit__icon--wide" />
  return (
    <svg className="summit__icon" viewBox="0 0 24 24" aria-hidden>
      {kind === 'user' && (
        <g fill="currentColor">
          <circle cx="12" cy="7.5" r="4.5" />
          <path d="M3.5 21c0-4.6 3.8-7.6 8.5-7.6s8.5 3 8.5 7.6Z" />
        </g>
      )}
      {kind === 'target' && (
        <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="11" cy="13" r="8.5" />
          <circle cx="11" cy="13" r="4.2" />
          <path d="M11 13 19.5 4.5M16.5 4.5h3v3" />
        </g>
      )}
      {kind === 'calendar' && (
        <g>
          <rect x="3" y="4.5" width="18" height="16.5" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <g fill="currentColor">
            <rect x="6.5" y="12" width="3" height="2.6" rx=".6" />
            <rect x="10.5" y="12" width="3" height="2.6" rx=".6" />
            <rect x="14.5" y="12" width="3" height="2.6" rx=".6" />
            <rect x="6.5" y="16" width="3" height="2.6" rx=".6" />
            <rect x="10.5" y="16" width="3" height="2.6" rx=".6" />
            <rect x="14.5" y="16" width="3" height="2.6" rx=".6" />
          </g>
        </g>
      )}
    </svg>
  )
}
