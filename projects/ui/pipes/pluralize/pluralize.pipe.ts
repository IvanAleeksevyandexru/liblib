import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '@epgu/ui/services/helper';

@Pipe({
  name: 'pluralize'
})
export class PluralizePipe implements PipeTransform {

  public transform(captions: string[], count: number): string {
    return HelperService.pluralize(count, captions);
  }

}
