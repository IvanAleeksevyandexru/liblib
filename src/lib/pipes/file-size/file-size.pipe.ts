import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  public transform(value: number): string {
    if (value <= 1024 * 100) {
      return Math.ceil(value / 1024) + ' Кб';
    }
    return (Math.round(value / 1024 / 1024 * 100) / 100) + ' Мб';
  }
}
