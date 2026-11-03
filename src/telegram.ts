type TgWebApp = {
  ready(): void
  expand(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  setBottomBarColor?(color: string): void
  disableVerticalSwipes?(): void
  HapticFeedback?: { selectionChanged?(): void }
}

const BG = '#010509'

/** Безопасно инициализирует Telegram WebApp; вне Telegram ничего не делает. */
export function initTelegram() {
  const tg = (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp
  if (!tg) return
  tg.ready()
  tg.expand()
  tg.setHeaderColor(BG)
  tg.setBackgroundColor(BG)
  tg.setBottomBarColor?.(BG)
  tg.disableVerticalSwipes?.()
}

/** Очень лёгкий тактильный отклик при смене значения; вне Telegram ничего не делает. */
export function hapticSelection() {
  try {
    ;(window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp?.HapticFeedback?.selectionChanged?.()
  } catch {
    // недоступно — не критично
  }
}

export type TgUser = { first_name?: string; last_name?: string; username?: string; photo_url?: string }

/** Пользователь Telegram (имя, аватар); вне Telegram — null. Свои копии не храним. */
export function telegramUser(): TgUser | null {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { initDataUnsafe?: { user?: TgUser } } } }).Telegram?.WebApp
    return tg?.initDataUnsafe?.user ?? null
  } catch {
    return null
  }
}
