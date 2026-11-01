# Telegram setup One% (актуально на 2026-10-22)

- Схема: onepercent-v2 (main) → GitHub → Netlify (автодеплой) → Telegram Mini App @onepercentfit_bot.
- Production URL: https://dreamy-clafoutis-385996.netlify.app/ (бот уже открывает этот адрес).
- Как обновить Mini App: push в main → Netlify собирает сам (`npm run build`, папка `dist`).
- Если push в main заблокирован: pull request, пользователь нажимает Merge.
- Бот: @onepercentfit_bot, код в старом репозитории onepercent-app (aiogram, polling), хостинг Railway, сервис `worker`.
- Переменные бота (BOT_TOKEN, WEBAPP_URL) хранятся только в Railway. В git и в эту среду не попадают.
- Сменить адрес Mini App: изменить WEBAPP_URL в Railway и перезапустить `worker` (делает пользователь).
- chat_id бот не хранит; в личном чате он равен Telegram ID пользователя.
- Секретов в среде Claude нет: нет доступа к боту, Railway и Netlify. Отправлять в Telegram отсюда нельзя.
- Старые репозитории onepercent-app и onepercent-web в работе v2 не читать.
