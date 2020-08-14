import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pluralize'
})
export class PluralizePipe implements PipeTransform {

  public transform(captions: string[], count: number): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return captions[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[(count % 10 < 5) ? count % 10 : 5]];
  }

}
