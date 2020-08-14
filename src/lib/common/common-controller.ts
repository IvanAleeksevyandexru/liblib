import { EventEmitter, OnDestroy } from '@angular/core';

export abstract class CommonController implements OnDestroy {
  protected destroyed$ = new EventEmitter<void>();

  public ngOnDestroy() {
    this.destroyed$.emit();
    this.destroyed$.complete();
  }

  public trackByFn(index: number, item: any) {
    return item.trackBy();
  }
}
