import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalLetter'
})
export class CapitalLetterPipe implements PipeTransform {

  public transform(value: string, ...args: any[]): any {
    if (!value) {
      return '';
    }
    return value[0].toUpperCase() + value.slice(1).toLowerCase();
  }

}
