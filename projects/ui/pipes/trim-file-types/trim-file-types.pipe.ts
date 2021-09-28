import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimFileTypes'
})
export class TrimFileTypesPipe implements PipeTransform {

  public transform(value: string, ...args: unknown[]): string {
    return value.replace(/,/g, ', ');
  }

}
