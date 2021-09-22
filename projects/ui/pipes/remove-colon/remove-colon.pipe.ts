import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeColon'
})
export class RemoveColonPipe implements PipeTransform {

  public transform(value: string): string {
    return value && value[value.length - 1] === ':' ? value.slice(0, -1) : value;
  }

}
