import { Pipe, PipeTransform } from '@angular/core';
import { differenceInDays, differenceInMinutes, format } from 'date-fns';

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

    const start = new Date();
    const end = new Date(date);
    const minInDay = 1440;
    const daysWords = ['день', 'дня', 'дней'];
    const minDiff = +differenceInMinutes(end, start);
    const dayDiff = +differenceInDays(end, start);

    if (start > end || minDiff <= minInDay) {
      return 'Скоро будет удалён';
    }

    if (minDiff <= minInDay * 7) {
      return 'Будет удалён через ' + dayDiff + ' ' + declOfNum(dayDiff, daysWords);
    } else {
      return 'Будет удалён ' + format(end, 'dd.MM.yyyy');
    }

  }

}
