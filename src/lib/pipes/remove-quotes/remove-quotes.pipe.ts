import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeQuotes'
})
export class RemoveQuotesPipe implements PipeTransform {

  public transform(value: string): string {
    return value ? value.replace(/[«»]/g, '') : '';
  }

}
