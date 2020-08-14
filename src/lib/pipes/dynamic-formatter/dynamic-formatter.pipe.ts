import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicFormatter'
})
export class DynamicFormatterPipe implements PipeTransform {

  public transform(value: string, func: (...addArgs: any[]) => string, ...args: any[]): string {
    return func(...args);
  }

}
