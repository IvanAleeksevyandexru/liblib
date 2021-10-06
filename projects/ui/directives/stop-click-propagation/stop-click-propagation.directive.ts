import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[libStopClickPropagation]'
})
export class StopClickPropagationDirective {

  @HostListener('click', ['$event'])
  public onClick(event: Event) {
    if (event) {
      event.stopPropagation();
    }
  }

}
