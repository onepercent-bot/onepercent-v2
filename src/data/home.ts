export type DayState = 'planned' | 'rest' | 'done'

/** Временные данные Главной — совпадают с референсом. */
export const homeMock = {
  muscle: 'Грудь',
  coach: { title: 'Выбор тренера', subtitle: 'По восстановлению и вашей анкете' },
  week: [
    { label: 'Пн', state: 'planned' },
    { label: 'Вт', state: 'rest' },
    { label: 'Ср', state: 'planned' },
    { label: 'Чт', state: 'rest' },
    { label: 'Пт', state: 'planned' },
    { label: 'Сб', state: 'done' },
    { label: 'Вс', state: 'planned', today: true },
  ] as { label: string; state: DayState; today?: boolean }[],
  last: { title: 'Ноги', meta: '40 мин', when: 'вчера' },
}
