# Telegram setup (факты из onepercent-app, 2026-10-21)

- Бот: @onepercentfit_bot, Python + aiogram 3, режим polling (поэтому getUpdates даёт 409).
- Репозиторий бота: onepercent-bot/onepercent-app, запуск: `bot.py` (Procfile: `worker: python bot.py`).
- Хостинг бота: Railway, проект `imaginative-fascination`, сервис `worker`. Лишний проект `inspiring-analysis` падает, можно удалить.
- BOT_TOKEN: только переменная окружения Railway (`BOT_TOKEN`), в git не хранится. Шаблон: `.env.example`.
- WEBAPP_URL: переменная Railway; бот подставляет её в кнопку «Открыть one percent» (web_app) в reply-клавиатуре.
- chat_id: бот его не хранит. Есть только `from_user.id` в обработчике сообщений. В личном чате chat_id = Telegram ID пользователя.
- Mini App (старая версия, onepercent-app): https://onepercent-bot.github.io/onepercent-app/webapp/ (GitHub Pages, ветка main).
- Deploy старой версии: push в main onepercent-app → Pages обновляется сам. Бот на Railway деплоится из того же репозитория.
- onepercent-v2 deploy: `.github/workflows/pages.yml` (GitHub Pages, push в main или claude/home-screen, `base: './'`). Требует включить Pages: Settings → Pages → Source: GitHub Actions.
- HTTPS URL для v2 (после включения Pages): https://onepercent-bot.github.io/onepercent-v2/ (не проверен).
- Привязка бота к v2: поменять WEBAPP_URL в Railway (сервис `worker`) на этот URL и перезапустить сервис. Не сделано.
- Secrets в этой среде: нет (ни BOT_TOKEN, ни Railway-токена, ни chat_id).
- Отправка от бота: `https://api.telegram.org/bot<BOT_TOKEN>/sendMessage` (токен идёт в URL, не в Bearer-заголовок).
- Токена в этой среде нет. Нужен BOT_TOKEN и chat_id, прежде чем отправлять сообщения отсюда.
- Не читать onepercent-app в следующих задачах: всё нужное записано здесь.
