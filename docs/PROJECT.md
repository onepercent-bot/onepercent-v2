# One% — состояние проекта

Обновлено: 2026-11-02 (Упражнения: сетка групп, Зал / Дом / Без инвентаря)

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
| Упражнения | `src/screens/Exercises.tsx`, данные — `src/data/exercises.ts` (+ зашифрованные `public/data/ex*.bin`) |
| Profile | `src/screens/Profile.tsx` — заглушка + временная кнопка сброса анкеты (`src/dev/`) |

## Архитектура

- Навигация — состояние в `src/App.tsx`: `welcome | onboarding | summit | app`, внутри `app` вкладки `home | profile`.
- В нижней навигации 4 пункта; «Аналитика» пока не подключена.
- Упражнения: группы мышц сеткой 2 колонки (Кардио — широкая снизу), иконки `src/assets/groups/*.webp` через `src/components/MuscleIcon.tsx` →
  вкладки Зал / Дом / Без инвентаря → плитки по 2 в ряд → карточка (видео Bunny, мышцы, инвентарь, уровень, техника).
  «Руки» сначала делятся на Бицепс / Трицепс / Предплечья (в предплечьях — ещё упражнения с полем `extra`).
  Персонаж строго по полу: мужчинам — мужские манекены, женщинам — блондинка, девушка-манекен и брюнетка (домашняя коллекция).
  Зал / Дом / Без инвентаря — одна функция `placesOf` в `src/data/exercises.ts`: equipment Vital + `needs`
  (снаряды из описания Vital и поправки по кадру видео); одно упражнение может быть в нескольких вкладках.
  Кадры Vital разной формы: в карточке — целиком (`video.ar`), в плитке — квадрат с обрезкой вокруг человека (`video.pos`).
  Данные: `vital-exercises.json` + Bunny API → зашифрованные `public/data/ex.gz.bin` / `ex.bin`;
  приложение скачивает и расшифровывает их при открытии раздела (`loadExercises`). Названия и техника — на русском.
- Анкета: тип `Profile` и функции в `src/onboarding.ts`; хранится в `localStorage`
  (`onepercent:profile:v2`, флаг `onepercent:onboarded:v2`). Чтения анкеты в UI пока нет.
- Telegram WebApp изолирован в `src/telegram.ts`.
- Дизайн-токены — `src/styles/tokens.css`; стили по экранам в `src/styles/`.
- Персонаж Home один (`home-hero.webp`), от пола не зависит; женского персонажа нет.

## Данные Vital Animations (куплено)

- Хранятся у владельца на Mac (`1600VitalAnimations`), в репозиторий не кладутся.
- Все 7 JSON (1231 упражнение) сведены в один файл и лежат в приватном артефакте владельца: https://claude.ai/artifact/1S5AMVGU6tVYQgqXRGjCgF (файл `vital-exercises.json`, читать через Artifact read с `path`).
- Структура: коллекции → папка видео `NNNN.mp4` + JSON. Видео: белый фон, 3D-манекен.
- Поля JSON: `id, name, bodyPart, target, secondaryMuscles, equipment, instructions, description, difficulty, category` (англ.).
- `id` уникальны во всех коллекциях → видео связывается по `id`.
- Получено 7 JSON, 1231 упражнение: зал ~830 (100gym, 200, 100, 100female, 200female, 130male) + 399 дома без инвентаря (400home).
- Не получены: Yoga, Home/Wall Pilates, Face, Office (~370) — позже.
- ~60 упражнений повторяются в мужской и женской коллекциях (вероятно, разные манекены).
- Названия мышц непоследовательны (~30 основных, ~40 вспомогательных) — нужен словарь в наши ~15 зон.

## Очередь модулей

1. **Упражнения** — экраны готовы. Осталось: связь с Home (тап по мышце), позже — перевести репозиторий в приватный.
2. Muscle map (гибрид: купленная 3D-модель + маски мышц) — модель не выбрана.
3. Тренировочный процесс: подходы / повторения / веса.
4. История тренировок, прогрессия нагрузки.
5. Бэкенд и аккаунты (перенос анкеты с устройства на сервер).
6. Видео — Bunny Stream: загружено 988 видео (все коллекции; дом — частично, ~230 не хватает). CDN `vz-fd335db2-2ed.b-cdn.net`, доступ по Referer домена мини-аппа.
7. AI-логика, питание, аналитика, профиль.
8. Выпуск в App Store / Google Play (Capacitor).
