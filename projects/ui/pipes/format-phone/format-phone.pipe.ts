import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhone'
})
export class FormatPhonePipe implements PipeTransform {

  public transform(value: any, ...args: any[]): any {
    return value.replace(/^(.{2})(.{8})(.{2})(.*)$/, '$1 $2-$3-$4').replace(')', ') ');
  }

}
