import { Pipe, PipeTransform } from '@angular/core';
import { ReplaceOptions } from '@epgu/ui/models';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  public transform(input: string, options: ReplaceOptions): string {
    try {
      return input.replace(options.pattern, options.replacement);
    } catch (e) {
      return input;
    }
  }

}
