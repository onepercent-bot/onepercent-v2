# One% — состояние проекта

Обновлено: 2026-10-31

## Стек

React 19 + TypeScript + Vite. Без роутера и бэкенда. Шрифт Inter. Деплой мини-аппа — см. `TELEGRAM_SETUP.md`.

## Готово

| Модуль | Где |
|---|---|
| Welcome | `src/screens/Welcome.tsx` |
| Анкета, 6 шагов | `src/screens/onboarding/Onboarding.tsx` |
| NumericWheelPicker | `src/components/NumericWheelPicker.tsx` |
| Summit (гора) | `src/screens/Summit.tsx` |
| Home | `src/screens/Home.tsx` + `src/components/*`, данные — `src/data/home.ts` (mock) |
| Profile | `src/screens/Profile.tsx` — заглушка + временная кнопка сброса анкеты (`src/dev/`) |

## Архитектура

- Навигация — состояние в `src/App.tsx`: `welcome | onboarding | summit | app`, внутри `app` вкладки `home | profile`.
- В нижней навигации 4 пункта; «Упражнения» и «Аналитика» пока не подключены.
- Анкета: тип `Profile` и функции в `src/onboarding.ts`; хранится в `localStorage`
  (`onepercent:profile:v2`, флаг `onepercent:onboarded:v2`). Чтения анкеты в UI пока нет.
- Telegram WebApp изолирован в `src/telegram.ts`.
- Дизайн-токены — `src/styles/tokens.css`; стили по экранам в `src/styles/`.
- Персонаж Home один (`home-hero.webp`), от пола не зависит; женского персонажа нет.

## Данные Vital Animations (куплено)

- Хранятся у владельца на Mac (`1600VitalAnimations`), в репозиторий не кладутся.
- Структура: коллекции → папка видео `NNNN.mp4` + JSON. Видео: белый фон, 3D-манекен.
- Поля JSON: `id, name, bodyPart, target, secondaryMuscles, equipment, instructions, description, difficulty, category` (англ.).
- `id` уникальны во всех коллекциях → видео связывается по `id`.
- Получено 7 JSON, 1231 упражнение: зал ~830 (100gym, 200, 100, 100female, 200female, 130male) + 399 дома без инвентаря (400home).
- Не получены: Yoga, Home/Wall Pilates, Face, Office (~370) — позже.
- ~60 упражнений повторяются в мужской и женской коллекциях (вероятно, разные манекены).
- Названия мышц непоследовательны (~30 основных, ~40 вспомогательных) — нужен словарь в наши ~15 зон.

## Очередь модулей

1. **Упражнения** — в работе: согласование макета (список + карточка с видео Vital).
2. Muscle map (гибрид: купленная 3D-модель + маски мышц) — модель не выбрана.
3. Тренировочный процесс: подходы / повторения / веса.
4. История тренировок, прогрессия нагрузки.
5. Бэкенд и аккаунты (перенос анкеты с устройства на сервер).
6. Хранилище видео (CDN) — поставщик не выбран.
7. AI-логика, питание, аналитика, профиль.
8. Выпуск в App Store / Google Play (Capacitor).
