import { Pipe, PipeTransform } from '@angular/core';
import { parse, startOfDay, differenceInDays, getYear, format } from 'date-fns';
import { ru } from 'date-fns/locale';

@Pipe({
  name: 'timeToEventGeps'
})
export class TimeToEventGepsPipe implements PipeTransform {

  public transform(date: string, hyphenation?: boolean, feed?: boolean): string {
    if (!date) {
      return '';
    }

    const whiteSpace = hyphenation ? ' ' : '<br>';
    const end = startOfDay(new Date());
    const start = feed ? new Date(date) : parse(date, 'dd.MM.yyyy HH:mm', new Date());
    let dateText;

    const daysDiff = differenceInDays(end, startOfDay(start));
    const yearsDiff = getYear(new Date()) === getYear(start);
    const days = {
      0: 'Сегодня ',
      '-1': 'Завтра ',
      1: 'Вчера '
    };

    if (daysDiff <= 1) {
      dateText = days[daysDiff];
    }

    if (yearsDiff) {
      return dateText ? dateText + whiteSpace + format(start, 'HH:mm', { locale: ru }) :
        format(start, 'dd MMMM', { locale: ru }) + whiteSpace + format(start, 'HH:mm', { locale: ru });
    }

    return format(start, 'dd.MM.yyyy', { locale: ru }) + whiteSpace + format(start, 'HH:mm', { locale: ru });
  }

}
