import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment';

const moment = moment_;

@Pipe({
  name: 'timeToEventGeps'
})
export class TimeToEventGepsPipe implements PipeTransform {

  public transform(date: string, hyphenation?: boolean, feed?: boolean): string {
    if (!date) {
      return '';
    }

    const whiteSpace = hyphenation ? ' ' : '<br>';
    moment.locale('ru');
    const end = moment().startOf('day');
    const start = feed ? moment(date) : moment(date, 'DD.MM.YYYY HH:mm');
    let dateText;

    const daysDiff = end.diff(start.clone().startOf('day'), 'days');
    const yearsDiff = moment().format('YYYY') === start.format('YYYY');
    const days = {
      0: 'Сегодня ',
      '-1': 'Завтра ',
      1: 'Вчера '
    };

    if (daysDiff <= 1) {
      dateText = days[daysDiff];
    }

    if (yearsDiff) {
      return dateText ? dateText + whiteSpace + start.format('HH:mm') :
        start.format('DD MMMM') + whiteSpace + start.format('HH:mm');
    }

    return start.format('DD.MM.YYYY') + whiteSpace + start.format('HH:mm');
  }

}
