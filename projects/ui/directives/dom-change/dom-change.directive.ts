import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[domChange]'
})
export class DomChangeDirective implements OnDestroy {
  private changes: MutationObserver;

  @Output()
  public domChange = new EventEmitter();

  constructor(private elementRef: ElementRef) {
    const element = this.elementRef.nativeElement;

    this.changes = new MutationObserver(() => this.domChange.emit());

    this.changes.observe(element, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }
}
