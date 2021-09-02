import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse'
})
export class ReversePipe implements PipeTransform {

  public transform(value: any[], applyReverse = true): any[] {
    if (applyReverse) {
      return value.slice().reverse();
    }
    return value;
  }

}
