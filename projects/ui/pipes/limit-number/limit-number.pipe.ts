import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limitNumber'
})
export class LimitNumberPipe implements PipeTransform {

  public transform(value: any, max = 99): any {
    return Number(value) > Number(max) ? `${max}+` : String(value);
  }

}
