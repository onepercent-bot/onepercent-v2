import { ResetOnboardingButton } from '../dev/ResetOnboardingButton'

export function Profile({ onRestartOnboarding }: { onRestartOnboarding: () => void }) {
  return (
    <main className="profile">
      <h1 className="profile__title">Профиль</h1>
      <ResetOnboardingButton onReset={onRestartOnboarding} />
    </main>
  )
}
