import { ChevronRightIcon, DumbbellIcon } from './Icons'

export function Recommended({ title, subtitle, onClick }: { title: string; subtitle: string; onClick?: () => void }) {
  return (
    <button type="button" className="card reco tappable" onClick={onClick}>
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
