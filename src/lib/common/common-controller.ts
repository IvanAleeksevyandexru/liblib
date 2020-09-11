import { Component, Directive, EventEmitter, OnDestroy } from '@angular/core';

@Directive()
export class CommonController implements OnDestroy {
  protected destroyed$ = new EventEmitter<void>();

  public ngOnDestroy() {
    this.destroyed$.emit();
    this.destroyed$.complete();
  }

  public trackByFn(index: number, item: any) {
    return item.trackBy();
  }
}
