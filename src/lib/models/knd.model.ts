export interface KndInterface {
  totalCurrent: number;
  totalUpcoming: number;
  totalLast: number;
}

export type kndType = 'totalLast' |    // прошедние
                      'totalCurrent' | // текущие
                      'totalUpcoming'; // будущие

export type StateKndType = 'E' | // enabled (пришли)
                           'D' | // disabled (нет проверок или выключен)
                           'F' | // ошибка
                           'U';  // uploading (загрузка)
