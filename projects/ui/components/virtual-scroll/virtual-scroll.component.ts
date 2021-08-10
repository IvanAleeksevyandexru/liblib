import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import {
  CdkVirtualScrollViewport,
  FixedSizeVirtualScrollStrategy,
  ScrollDispatcher,
  ViewportRuler,
  VirtualScrollStrategy
} from '@angular/cdk/scrolling';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { Observable, Subject, Subscription } from 'rxjs';

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

  @Output() public scrollBottomReached = new EventEmitter();

  public scrollViewport: CdkVirtualScrollViewport;
  public inited = new Subject<boolean>();
  public bottomReachedSubscription: Subscription;
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
    this.bottomReachedSubscription = this.scrollViewport.elementScrolled().subscribe((scrollEvt) => {
      const renderedOffset = this.scrollViewport.getOffsetToRenderedContentStart();
      const scrollCnt = scrollEvt.target as HTMLElement;
      const scrollArea = scrollCnt.children[0];
      if (scrollArea.clientHeight && scrollCnt.scrollTop - renderedOffset + scrollCnt.clientHeight >= scrollArea.clientHeight) {
        this.scrollBottomReached.emit();
      }
    });
  }

  public ngOnDestroy() {
    this.bottomReachedSubscription.unsubscribe();
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
