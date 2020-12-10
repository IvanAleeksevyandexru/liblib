import { Directive, ElementRef, Output, EventEmitter, HostListener, NgZone } from '@angular/core';

@Directive({
    selector: '[libClickOutside]'
})
export class ClickOutsideDirective {

  constructor(elementRef: ElementRef,
              private ngZone: NgZone) {
    this.elementRef = elementRef;
  }

  private elementRef: ElementRef;

  @Output()
  public clickOutside = new EventEmitter<Event>();

  @HostListener('document:click', ['$event'])
  public onClick(e: Event) {
    this.ngZone.runOutsideAngular(() => {
      const clickedInside = this.elementRef.nativeElement.contains(e.target);
      if (!clickedInside) {
        this.clickOutside.emit(e);
      }
    });
  }
}
