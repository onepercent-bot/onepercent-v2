import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const ChevronDownIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="m5 8.5 7 7 7-7" />
  </svg>
)

export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="m8.5 5 7 7-7 7" />
  </svg>
)

export const ArrowRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M3.5 12h17M13.5 5l7 7-7 7" />
  </svg>
)

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
)

export const DumbbellIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 18" fill="currentColor" aria-hidden {...p}>
    <rect x="0.5" y="7.6" width="2.6" height="2.8" rx="1" />
    <rect x="3" y="4.3" width="3" height="9.4" rx="1.5" />
    <rect x="7" y="0.5" width="3.6" height="17" rx="1.8" />
    <rect x="10" y="7.5" width="12" height="3" rx="1" />
    <rect x="21.4" y="0.5" width="3.6" height="17" rx="1.8" />
    <rect x="26" y="4.3" width="3" height="9.4" rx="1.5" />
    <rect x="28.9" y="7.6" width="2.6" height="2.8" rx="1" />
  </svg>
)

export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6.5V12l3.6 3.4" />
  </svg>
)

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3.5 10.6 12 3.6l8.5 7v8.8a1.6 1.6 0 0 1-1.6 1.6H5.1a1.6 1.6 0 0 1-1.6-1.6Z" />
    <path d="M10 21v-4.6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V21" />
  </svg>
)

export const ExercisesIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M1.5 12h2M22.5 12h-2M3.5 9v6M20.5 9v6M6.5 5v14M17.5 5v14M9.5 6.5v11M14.5 6.5v11M9.5 10.3h5M9.5 13.7h5" />
  </svg>
)

export const BarsIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 20.5h18M7.5 13v4M12 3.5V17M16.5 8.5V17" />
  </svg>
)

export const UserIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="7.5" r="4" />
    <path d="M4 20.5c0-4.1 3.6-6.8 8-6.8s8 2.7 8 6.8Z" />
  </svg>
)

export const BoltIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 30" fill="currentColor" aria-hidden {...p}>
    <path d="M12.6 0.6 2.2 16.4c-.4.6 0 1.4.8 1.4h5.6L6.4 28.6c-.2.9.9 1.4 1.4.6l10.4-15.9c.4-.6 0-1.4-.8-1.4h-5.5l2.2-10.6c.2-.9-1-1.4-1.5-.7Z" />
  </svg>
)

export const BarsFilledIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 26 26" fill="currentColor" aria-hidden {...p}>
    <rect x="0" y="14.5" width="6.6" height="11.5" rx="1.4" />
    <rect x="9.7" y="8" width="6.6" height="18" rx="1.4" />
    <rect x="19.4" y="0" width="6.6" height="26" rx="1.4" />
  </svg>
)

export const ChevronLeftIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="m15 5-7 7 7 7" />
  </svg>
)

export const FlameIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12.6 2.2c.3 2.6-.8 4.4-2.4 6-1.7 1.7-3.7 3.6-3.7 6.9A5.5 5.5 0 0 0 12 20.6a5.5 5.5 0 0 0 5.5-5.5c0-2.2-.9-3.8-1.9-5.1-.3 1.3-1 2.3-2 2.8.4-3.5-.2-7.6-1-10.6Z" />
  </svg>
)

export const PulseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M2.5 12h4l2.5-6 4 12 3-8 1.5 2h4" />
  </svg>
)

export const HeartIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M12 20.5s-8.5-5-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6-8.5 11-8.5 11Z" />
  </svg>
)

export const GymIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M3 21V9l9-5.5L21 9v12M7 21v-6h10v6M9 11h6" />
  </svg>
)

export const BodyIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2} {...p}>
    <circle cx="12" cy="4.5" r="2" />
    <path d="M5 9l7 1.5L19 9M12 10.5V15l-3 6M12 15l3 6" />
  </svg>
)

export const PullUpBarIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M4 21V5M20 21V5M4 8h16M2.5 5h3M18.5 5h3" />
  </svg>
)
