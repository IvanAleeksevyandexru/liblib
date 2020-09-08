import {
  Component, forwardRef, Input, ViewChild, ElementRef, NgZone,
  ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit, OnDestroy } from '@angular/core';
import {
  CdkVirtualScrollViewport, ScrollDispatcher, ViewportRuler,
  FixedSizeVirtualScrollStrategy, VirtualScrollStrategy } from '@angular/cdk/scrolling';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'lib-virtual-scroll',
  templateUrl: './virtual-scroll.component.html',
  styleUrls: ['./virtual-scroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScrollComponent implements AfterViewInit, OnDestroy {

  constructor(
      public changeDetectorRef: ChangeDetectorRef,
      public ngZone: NgZone,
      public scrollDispatcher: ScrollDispatcher,
      public viewportRuler: ViewportRuler) {
  }

  @Input() public itemSize: number;
  @Input() public scrollStrategy: VirtualScrollStrategy;

  public scrollViewport: CdkVirtualScrollViewport;
  public inited = new Subject<boolean>();
  @ViewChild('scrollComponent') public scrollComponent: PerfectScrollbarComponent;
  @ViewChild('contentWrapper') public contentWrapper: ElementRef;

  public ngAfterViewInit() {
    this.scrollViewport = new CdkVirtualScrollViewport(
      this.scrollComponent.directiveRef.elementRef,
      this.changeDetectorRef,
      this.ngZone,
      this.scrollStrategy || new FixedSizeVirtualScrollStrategy(this.itemSize || 20, 100, 200),
      null,
      this.scrollDispatcher,
      this.viewportRuler
    );
    this.scrollViewport._contentWrapper = this.contentWrapper;
    this.inited.next(true);
    this.scrollViewport.ngOnInit();
  }

  public ngOnDestroy() {
    this.scrollViewport.ngOnDestroy();
  }

  public whenInited(): Observable<boolean> {
    return this.inited.asObservable();
  }

  public scrollToIndex(index: number) {
    if (this.scrollViewport) {
      this.scrollViewport.scrollToIndex(index);
    }
  }

  public setTotalContentSize(totalContentSize: number) {
    if (this.scrollViewport) {
      this.scrollViewport.setTotalContentSize(totalContentSize);
    }
  }

}
