import { Pipe, PipeTransform } from '@angular/core';
import { differenceInDays, format, parse, startOfDay, Locale } from 'date-fns';
import { ru } from 'date-fns/locale'

@Pipe({
  name: 'timeToEvent'
})
export class TimeToEventPipe implements PipeTransform {

  public transform(
    date: string,
    snippetType: string = '',
    feedType: string = '',
    inlineDate: boolean = false,
    fullDate: boolean = false,
    customFormat: string = ''
  ): string {
    if (!date) {
      return '';
    }

    const rebuildDate = (snippetType === 'EQUEUE' || snippetType === 'IM') &&
      (feedType === 'ORDER' || feedType === 'EQUEUE' || feedType === 'DRAFT' || feedType === 'IMExpireDate');

    if (rebuildDate) {
      const reT = new RegExp('T');
      const re = new RegExp('-');
      const dayPart = date.split(reT)[0].split(re);
      const day = dayPart[0] + '-' + dayPart[1] + '-' + dayPart[2];
      const time = date.split(reT)[1].substring(0, 5);
      date = day + ' ' + time;
    }

    if (snippetType !== 'EQUEUE' && feedType !== 'IM' && feedType === 'IMExpireDate') {
      return format(new Date(date), 'HH:mm dd.MM.yyyy');
    }

    const end = new Date();
    const start = new Date(date);
    const startInitial = rebuildDate ? parse(date, 'yyyy-MM-dd HH:mm', new Date()): new Date(date);
    let dateText;

    const startOfToday = startOfDay(end);
    const startOfDate = startOfDay(start);
    const daysDiff = differenceInDays(startOfToday, startOfDate);
    const days = {
      0: 'Сегодня ',
      '-1': 'Завтра ',
      1: 'Вчера '
    };

    if (Math.abs(daysDiff) <= 1) {
      dateText = days[daysDiff];
    }

    if (customFormat) {
      return dateText ? dateText + format(startInitial, customFormat, {locale: ru}) : format(startInitial, customFormat, {locale: ru});
    }

    if (fullDate) {
      return dateText ? dateText + format(startInitial, 'dd.MM.yyyy, EEEEEE, HH:mm', {locale: ru}) : format(startInitial, 'dd.MM.yyyy, EEEEEE, HH:mm', {locale: ru});
    }

    if (inlineDate) {
      return dateText ? dateText + format(startInitial,'HH:mm', {locale: ru}) : format(startInitial, 'dd.MM.yyyy, HH:mm', {locale: ru});
    }
    return dateText ? dateText + '<div class="feed-event-date"></div>' + format(startInitial,'HH:mm', {locale: ru}) :
      format(startInitial, 'dd.MM.yyyy, HH:mm', {locale: ru})
        .split(' ').join('<div class="feed-event-date">');
  }

}
