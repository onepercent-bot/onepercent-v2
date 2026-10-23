import { resetOnboarding } from '../onboarding'

/**
 * ВРЕМЕННАЯ кнопка для тестирования анкеты в Telegram.
 * Удалить: этот файл + его использование в screens/Profile.tsx.
 */
export function ResetOnboardingButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      className="cta dev-reset tappable"
      onClick={() => {
        resetOnboarding()
        onReset()
      }}
    >
      Пройти анкету заново
    </button>
  )
}
