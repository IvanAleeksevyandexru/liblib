import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[libOnlyNumbers]'
})
export class OnlyNumbersDirective {

  constructor() { }

  @HostListener('keydown', ['$event']) public onKeyDown(e: KeyboardEvent): boolean {
    return (e.key === 'Backspace' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') ? true : (new RegExp('^\\d+$')).test(e.key);
  }
}
