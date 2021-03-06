import { Pipe, PipeTransform } from '@angular/core';

const roman = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1
};

@Pipe({
  name: 'toRoman'
})
export class ToRomanPipe implements PipeTransform {

  public transform(num: number): any {
    let result = '';

    for (const i of Object.keys(roman)) {
      const q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      result += i.repeat(q);
    }

    return result;
  }

}
