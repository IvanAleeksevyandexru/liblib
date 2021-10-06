import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';

const moment = moment_;

@Pipe({
  name: 'timeLeft'
})
export class TimeLeftPipe implements PipeTransform {

  public transform(date: string): string {
    if (!date) {
      return '';
    }

    const declOfNum = (diffDays: number, titles: string[]): string => {
      const cases = [2, 0, 1, 1, 1, 2];
      return titles[(diffDays % 100 > 4 && diffDays % 100 < 20) ? 2 : cases[(diffDays % 10 < 5) ? diffDays % 10 : 5]];
    };

    const start = moment();
    const end = moment(date);
    const minInDay = 1440;
    const daysWords = ['день', 'дня', 'дней'];
    const minDiff = +end.diff(start, 'minutes');
    const dayDiff = +end.diff(start, 'days');

    if (start > end || minDiff <= minInDay) {
      return 'Скоро будет удалён';
    }

    if (minDiff <= minInDay * 7) {
      return 'Будет удалён через ' + dayDiff + ' ' + declOfNum(dayDiff, daysWords);
    } else {
      return 'Будет удалён ' + end.format('DD.MM.YYYY');
    }

  }

}
