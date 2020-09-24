import { Pipe, PipeTransform } from '@angular/core';
import * as moment_ from 'moment/min/moment.min.js';

const moment = moment_;

@Pipe({
  name: 'timeToEvent'
})
export class TimeToEventPipe implements PipeTransform {

  public transform(
    date: string,
    snippetType: string = '',
    feedType: string = '',
    inlineDate: boolean = false,
    fullDate: boolean = false
  ): string {
    if (!date) {
      return '';
    }

    if ((snippetType === 'EQUEUE' || snippetType === 'IM') &&
      (feedType === 'ORDER' || feedType === 'EQUEUE' || feedType === 'DRAFT' || feedType === 'IMExpireDate')) {
      const reT = new RegExp('T');
      const re = new RegExp('-');
      const dayPart = date.split(reT)[0].split(re);
      const day = dayPart[0] + '-' + dayPart[1] + '-' + dayPart[2];
      const time = date.split(reT)[1].substring(0, 5);
      date = day + ' ' + time;
    }

    if (snippetType !== 'EQUEUE' && feedType !== 'IM' && feedType === 'IMExpireDate') {
      return moment(date).format('HH:mm DD.MM.YYYY');
    }

    moment.locale('ru');
    const end = moment();
    const start = moment(date);
    const startInitial = moment(date);
    let dateText;

    const startOfToday = end.startOf('day');
    const startOfDate = start.startOf('day');
    const daysDiff = startOfToday.diff(startOfDate, 'days');
    const days = {
      0: 'Сегодня ',
      '-1': 'Завтра ',
      1: 'Вчера '
    };

    if (Math.abs(daysDiff) <= 1) {
      dateText = days[daysDiff];
    }

    if (fullDate) {
      return dateText ? dateText + startInitial.format('DD.MM.YYYY, ddd, HH:mm') : startInitial.format('DD.MM.YYYY, ddd, HH:mm');
    }

    if (inlineDate) {
      return dateText ? dateText + startInitial.format('HH:mm') : startInitial.format('DD.MM.YYYY, HH:mm');
    }
    return dateText ? dateText + '<div class="feed-event-date"></div>' + startInitial.format('HH:mm') :
      startInitial.format('DD.MM.YYYY HH:mm')
        .split(' ').join('<div class="feed-event-date">');
  }

}
