import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { resetOnboarding } from '../onboarding'

/**
 * ВРЕМЕННАЯ кнопка для тестирования анкеты в Telegram.
 * Удалить: этот файл + его использование в screens/Profile.tsx.
 * Перед сбросом — подтверждение, чтобы не нажать случайно (решение владельца 2026-11-04).
 */
export function ResetOnboardingButton({ onReset }: { onReset: () => void }) {
  const [ask, setAsk] = useState(false)
  return (
    <>
      <button type="button" className="cta dev-reset tappable" onClick={() => setAsk(true)}>
        Пройти анкету заново
      </button>
      {ask && (
        <Confirm
          onCancel={() => setAsk(false)}
          onConfirm={() => {
            resetOnboarding()
            onReset()
          }}
        />
      )}
    </>
  )
}

function Confirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return createPortal(
    <div className={`pg-sheet${shown ? ' is-on' : ''}`} role="alertdialog" aria-modal="true" aria-label="Пройти анкету заново?">
      <button type="button" className="pg-sheet__scrim" aria-label="Отмена" onClick={onCancel} />
      <div className="pg-sheet__panel dev-confirm">
        <div className="pg-sheet__grip" />
        <h2 className="pg-sheet__title">Пройти анкету заново?</h2>
        <p className="dev-confirm__text">
          Ответы анкеты — цель, уровень, вес, рост, график, рабочие веса — будут удалены, и программа тренировок
          соберётся заново по новым ответам.
        </p>
        <p className="dev-confirm__text">История тренировок и прогресс сохранятся.</p>
        <button type="button" className="cta tappable dev-confirm__ok" onClick={onCancel}>
          Оставить как есть
        </button>
        <button type="button" className="dev-confirm__danger tappable" onClick={onConfirm}>
          Да, пройти заново
        </button>
      </div>
    </div>,
    document.body,
  )
}
