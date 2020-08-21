import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '../../services/helper/helper.service';

@Pipe({
  name: 'pluralize'
})
export class PluralizePipe implements PipeTransform {

  public transform(captions: string[], count: number): string {
    return HelperService.pluralize(count, captions);
  }

}
