// Автозапуск роликов упражнений на iOS (окно Telegram): беззвучность выставляем до загрузки
// и запускаем видео явно — атрибута autoPlay там иногда недостаточно.
export function autoplay(v: HTMLVideoElement | null) {
  if (!v) return
  v.muted = true
  v.defaultMuted = true
  v.setAttribute('muted', '')
  v.setAttribute('playsinline', '')
  const start = () => {
    const p = v.play()
    if (p) p.catch(() => {})
  }
  start()
  v.addEventListener('loadeddata', start, { once: true })
}
