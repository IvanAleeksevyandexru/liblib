export interface KndInterface {
  totalCurrent?: number;  // текущие
  totalUpcoming?: number; // будущие
  totalLast?: number;     // прошедние
}

export type StateKndType = 'E' | // enabled (пришли)
                           'D' | // disabled (нет проверок или выключен)
                           'F' | // ошибка
                           'U';  // uploading (загрузка)
