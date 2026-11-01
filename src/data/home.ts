export type DayState = 'planned' | 'rest' | 'done'

/** Временные данные Главной — совпадают с референсом. */
export const homeMock = {
  muscle: 'Грудь',
  coach: { title: 'Рекомендованная тренировка', subtitle: 'Оптимально под вашу анкету' },
  week: [
    { label: 'Пн', state: 'done' },
    { label: 'Вт', state: 'done' },
    { label: 'Ср', state: 'done' },
    { label: 'Чт', state: 'done' },
    { label: 'Пт', state: 'done' },
    { label: 'Сб', state: 'done' },
    { label: 'Вс', state: 'done' },
  ] as { label: string; state: DayState; today?: boolean }[],
  last: {
    muscle: 'Грудь',
    minutes: 60,
    exercises: [
      { name: 'Жим штанги лёжа', sets: 4 },
      { name: 'Жим гантелей на наклонной скамье', sets: 3 },
      { name: 'Сведение рук в кроссовере', sets: 3 },
      { name: 'Отжимания на брусьях', sets: 3 },
      { name: 'Разводка гантелей лёжа', sets: 3 },
    ],
  },
}
