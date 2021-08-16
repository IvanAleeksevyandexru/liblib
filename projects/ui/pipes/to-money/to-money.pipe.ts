import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'toMoney'
})
export class ToMoneyPipe implements PipeTransform {

  public transform(val: number | string): string {
    if (isNaN(+val)) {
      return val && val.toString();
    }
    const numberFormat = (amount) => {
      if (typeof amount === 'string') {
        amount = amount.replace(/ /g, '').replace(',', '.');
        if (!isNaN(amount)) {
          amount = Number(amount);
        }
      }
      if (typeof amount === 'number') {
        amount = amount.toFixed(2).toString();
      }
      const parts = amount.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      if (parts[1] !== '00') {
        amount = parts.join(',');
      } else {
        amount = parts[0];
      }
      return amount;
    };

    return numberFormat(val);
  }

}
