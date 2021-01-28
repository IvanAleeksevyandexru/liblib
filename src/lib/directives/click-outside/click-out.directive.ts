import { Directive, ElementRef, EventEmitter, Inject, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[libClickOutside]'
})
export class ClickOutsideDirective implements OnInit, OnDestroy {

  constructor(elementRef: ElementRef,
              private ngZone: NgZone) {
    this.elementRef = elementRef;
  }

  private elementRef: ElementRef;

  @Output()
  public clickOutside = new EventEmitter<Event>();

  public onClick(e: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(e.target);
    if (!clickedInside) {
      this.clickOutside.emit(e);
    }
  }

  public ngOnDestroy(): void {
    window.document.removeEventListener('click', null);
  }

  public ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      window.document.addEventListener('click', this.onClick.bind(this))
    })
  }
}
