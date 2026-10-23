import { ChevronRightIcon, DumbbellIcon } from './Icons'

export function Recommended({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <button type="button" className="card reco tappable">
      <span className="icon-disc reco__icon">
        <DumbbellIcon />
      </span>
      <span className="reco__text">
        <span className="reco__title">{title}</span>
        <span className="reco__sub">{subtitle}</span>
      </span>
      <ChevronRightIcon className="reco__go" />
    </button>
  )
}
