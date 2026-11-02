import { useId, type ReactNode } from 'react'

// Иконки групп мышц для раздела «Упражнения»: силуэт в приглушённом цвете,
// целевая зона подсвечена акцентом Главной. Цвета — в styles/exercises.css (.mi).

export type MuscleZone =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'abs'
  | 'cardio'
  | 'biceps'
  | 'triceps'
  | 'forearms'

function Body({ children }: { children?: ReactNode }) {
  return (
    <>
      <g className="mi__base">
        <circle cx="20" cy="5.6" r="2.9" />
        <path d="M13.4 10.4Q20 8.9 26.6 10.4L25.2 18Q24.6 22 24.4 25.6H15.6Q15.4 22 14.8 18Z" />
      </g>
      <g className="mi__limb">
        <path d="M13.2 11.4 11.3 18.6 10.4 25M26.8 11.4 28.7 18.6 29.6 25M17.6 25.4 16.9 32 16.7 38M22.4 25.4 23.1 32 23.3 38" />
      </g>
      {children}
    </>
  )
}

// Согнутая рука (крупный план): плечо горизонтально, предплечье вверх, кулак сверху справа.
const ARM =
  'M4 19C7 17 9 16.5 11 15.5 13 11 18 10.5 20 13.5L18.6 9.5C18 7.5 18.4 5.4 20 4.4 21.4 3.4 24 3.2 25.6 4.2 27.2 5.2 27.4 7.4 26.4 8.6L25.4 9.8C27.4 14 28.4 19 28 23 27.6 27 25 29 21.5 29L8 29.6C5 29.8 3 28 3 25V21C3 20 3.4 19.4 4 19Z'

function Arm({ hot }: { hot: ReactNode }) {
  const id = useId()
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={ARM} />
        </clipPath>
      </defs>
      <path className="mi__base" d={ARM} />
      <g className="mi__hot" clipPath={`url(#${id})`}>
        {hot}
      </g>
    </>
  )
}

const zones: Record<MuscleZone, ReactNode> = {
  chest: (
    <Body>
      <path className="mi__hot" d="M15.1 12Q17.4 10.9 19.5 11.8V15.3Q17 16.4 15.3 14.9Z M24.9 12Q22.6 10.9 20.5 11.8V15.3Q23 16.4 24.7 14.9Z" />
    </Body>
  ),
  back: (
    <Body>
      <path className="mi__hot" d="M14.5 11.8 19.4 12.6V21L16 18.6Z M25.5 11.8 20.6 12.6V21L24 18.6Z" />
    </Body>
  ),
  shoulders: (
    <Body>
      <circle className="mi__hot" cx="13.6" cy="11.4" r="2.3" />
      <circle className="mi__hot" cx="26.4" cy="11.4" r="2.3" />
    </Body>
  ),
  arms: (
    <Body>
      <path className="mi__hot-limb" d="M13.2 11.6 11.3 18.6 10.4 25M26.8 11.6 28.7 18.6 29.6 25" />
    </Body>
  ),
  legs: (
    <Body>
      <path className="mi__hot-limb" d="M17.6 25.6 16.9 32 16.7 38M22.4 25.6 23.1 32 23.3 38" />
    </Body>
  ),
  abs: (
    <Body>
      <rect className="mi__hot" x="17.3" y="16" width="5.4" height="8.2" rx="1.5" />
      <path className="mi__cut" d="M20 16.4V23.8M17.6 18.7H22.4M17.6 21.4H22.4" />
    </Body>
  ),
  cardio: (
    <>
      <path className="mi__hot" d="M20 33S7 25.4 7 16.3A6.4 6.4 0 0 1 20 13.2 6.4 6.4 0 0 1 33 16.3C33 25.4 20 33 20 33Z" />
      <path className="mi__cut mi__cut--pulse" d="M9.5 20.5H15L17.3 16.2 21 25 23.6 19.5 25 21H30.5" />
    </>
  ),
  biceps: <Arm hot={<ellipse cx="15.2" cy="15.6" rx="6.6" ry="4.4" />} />,
  triceps: <Arm hot={<ellipse cx="13" cy="29.4" rx="9.4" ry="3.9" />} />,
  forearms: <Arm hot={<path d="M17 4H30V24L21.6 21.6 20.6 13.8Z" />} />,
}

const body = new Set<MuscleZone>(['chest', 'back', 'shoulders', 'arms', 'legs', 'abs'])

export function MuscleIcon({ zone, className = '' }: { zone: MuscleZone; className?: string }) {
  return (
    <svg className={`mi ${className}`} viewBox={zone === 'cardio' ? '4 4 32 32' : body.has(zone) ? '7 1.5 26 38' : '0.5 1.5 30 30'} aria-hidden>
      {zones[zone]}
    </svg>
  )
}
