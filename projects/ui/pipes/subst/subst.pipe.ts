import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { HelperService } from '@epgu/ui/services/helper';

@Pipe({
  name: 'subst'
})
export class SubstPipe implements PipeTransform {

  // 'My name is %0, Im %1 years old' => 'My name is username, Im 1e6 years old'
  public transform(value: string | Observable<string>, ...args: string[]): string | Observable<string> {
    if (HelperService.isString(value) && args && args.length) {
      let result: string = value as string;
      let flattenArgs = [];
      args.forEach((arg) => flattenArgs = flattenArgs.concat(arg));
      flattenArgs.forEach((arg, index) => {
        result = result.replace(new RegExp('%' + index, 'g'), arg);
      });
      return result;
    } else {
      return value;
    }
  }

}
