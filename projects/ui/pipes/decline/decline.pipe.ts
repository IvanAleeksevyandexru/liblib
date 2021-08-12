import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decline'
})
export class DeclinePipe implements PipeTransform {

  public transform(val: number, arr: string[], addVal: boolean = true): string {
    if (!val) {
      return '';
    }

    return (addVal ? val + ' ' : '') + this.decline(val, arr);
  }

  private decline(val: number, titles: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(val % 100 > 4 && val % 100 < 20) ? 2 : cases[(val % 10 < 5) ? val % 10 : 5]];
  }

}
