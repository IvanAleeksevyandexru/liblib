import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[libStopScreenScroll]'
})
export class StopScreenScrollDirective {

  @HostListener('scroll', ['$event'])
  public onScroll(event: Event) {
    if (event) {
      event.preventDefault();
    }
  }

  @HostListener('touchmove', ['$event'])
  public onTouchMove(event: Event) {
    if (event) {
      event.preventDefault();
    }
  }

}
