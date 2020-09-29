import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertSize'
})
export class ConvertSizePipe implements PipeTransform {

  public transform(size: number, ...args: any[]): string {
    if (size === 0) {
      return '0 б';
    }
    const k = 1024;
    const sizes = ['б', 'Кб', 'Мб'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed()) + ' ' + sizes[i];
  }

}
