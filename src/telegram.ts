type TgWebApp = {
  ready(): void
  expand(): void
  setHeaderColor(color: string): void
  setBackgroundColor(color: string): void
  setBottomBarColor?(color: string): void
  disableVerticalSwipes?(): void
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
