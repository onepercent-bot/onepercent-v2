import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { hapticSelection } from '../telegram'

export type NumericWheelPickerProps = {
  open: boolean
  title: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  /** Вызывается при каждом смещении барабана на новое значение. */
  onChange?: (value: number) => void
  /** «Готово»: значение подтверждено. */
  onConfirm: (value: number) => void
  /** Закрытие без сохранения (тап по затемнению). */
  onClose: () => void
}

const VISIBLE = 5
const CLOSE_MS = 320

const decimals = (step: number) => (String(step).split('.')[1] ?? '').length
const fmt = (v: number, step: number) => v.toFixed(decimals(step)).replace('.', ',')

/**
 * Общий барабан One% для выбора числа из диапазона: возраст, рост, вес,
 * рабочие веса, вес подхода и т. п. Открывается снизу поверх экрана.
 */
export function NumericWheelPicker({ open, title, value, min, max, step = 1, unit, onChange, onConfirm, onClose }: NumericWheelPickerProps) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), CLOSE_MS)
    return () => clearTimeout(t)
  }, [open])

  // пока шторка открыта, фон не прокручивается
  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.add('wheel-lock')
    return () => document.documentElement.classList.remove('wheel-lock')
  }, [mounted])

  if (!mounted) return null

  return createPortal(
    <div className={`wheel-sheet${shown ? ' is-shown' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="wheel-sheet__scrim" aria-label="Закрыть" onClick={onClose} />
      <div className="wheel-sheet__panel">
        <span className="wheel-sheet__grab" aria-hidden />
        <h2 className="wheel-sheet__title">{title}</h2>
        <Wheel key={`${title}-${open}`} value={value} min={min} max={max} step={step} unit={unit} onChange={onChange} onPick={onConfirm} />
      </div>
    </div>,
    document.body,
  )
}

function Wheel({ value, min, max, step, unit, onChange, onPick }: { value: number; min: number; max: number; step: number; unit?: string; onChange?: (v: number) => void; onPick: (v: number) => void }) {
  const count = Math.floor((max - min) / step + 1e-9) + 1
  const toIndex = (v: number) => Math.min(count - 1, Math.max(0, Math.round((v - min) / step)))
  const toValue = (i: number) => +(min + i * step).toFixed(decimals(step))

  const listRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(() => toIndex(value))
  const indexRef = useRef(index)
  const itemH = () => (listRef.current?.querySelector('.wheel__item') as HTMLElement | null)?.offsetHeight || 40

  useLayoutEffect(() => {
    if (listRef.current) listRef.current.scrollTop = indexRef.current * itemH()
  }, [])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    const i = Math.min(count - 1, Math.max(0, Math.round(el.scrollTop / itemH())))
    if (i !== indexRef.current) {
      indexRef.current = i
      setIndex(i)
      hapticSelection()
      onChange?.(toValue(i))
    }
  }

  const scrollTo = (i: number) => listRef.current?.scrollTo({ top: i * itemH(), behavior: 'smooth' })

  // для клавиатуры/VoiceOver: стрелки двигают барабан
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') scrollTo(Math.min(count - 1, index + 1))
    else if (e.key === 'ArrowUp') scrollTo(Math.max(0, index - 1))
    else return
    e.preventDefault()
  }

  // рендерим только окрестность выбранного значения — диапазоны бывают большими
  const from = Math.max(0, index - 40)
  const to = Math.min(count - 1, index + 40)
  const items = []
  for (let i = from; i <= to; i++) {
    const d = Math.abs(i - index)
    items.push(
      <button key={i} type="button" tabIndex={-1} className={`wheel__item d${Math.min(d, 3)}`} style={{ top: `calc(${i} * var(--wheel-item))` }} onClick={() => scrollTo(i)}>
        {fmt(toValue(i), step)}
      </button>,
    )
  }

  return (
    <>
      <div className="wheel" style={{ '--wheel-visible': VISIBLE } as React.CSSProperties}>
        <div className="wheel__band" aria-hidden>
          {unit && <span className="wheel__unit">{unit}</span>}
        </div>
        <div
          className="wheel__list"
          ref={listRef}
          onScroll={onScroll}
          tabIndex={0}
          role="spinbutton"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={toValue(index)}
          aria-valuetext={`${fmt(toValue(index), step)}${unit ? ` ${unit}` : ''}`}
          onKeyDown={onKey}
        >
          <div className="wheel__track" style={{ height: `calc(${count - 1} * var(--wheel-item) + var(--wheel-item) * var(--wheel-visible))` }}>
            {items}
          </div>
        </div>
      </div>
      <button type="button" className="cta wheel-sheet__done tappable" onClick={() => onPick(toValue(index))}>
        Готово
      </button>
    </>
  )
}
