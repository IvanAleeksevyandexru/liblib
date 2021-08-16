import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class FormatTimePipe implements PipeTransform {

  public transform(time: number, ...args: any[]): string {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    const stringMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const stringSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${stringMinutes}:${stringSeconds}`;
  }

}
