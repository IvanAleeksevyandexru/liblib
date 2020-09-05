import {
  Directive, HostListener, Input, SkipSelf, ViewContainerRef, OnChanges, DoCheck, OnDestroy,
  TemplateRef, NgIterable, IterableDiffers, TrackByFunction, NgZone } from '@angular/core';
import { CdkVirtualForOf, CdkVirtualForOfContext } from '@angular/cdk/scrolling';
import { CollectionViewer, DataSource, ListRange } from '@angular/cdk/collections';
import { Subject, Observable } from 'rxjs';
import { VirtualScrollComponent } from '../../components/virtual-scroll/virtual-scroll.component';

// прокси-директива для оригинальной CdkVirtualForOf [cdkVirtualFor][cdkVirtualForOf]
// не возможно отнаследоваться от оригинальной директивы, т.к. она начинает сразу же в констукторе искать CdkVirtualScrollViewport
// создать CdkVirtualScrollViewport на упреждение и далее динамически переключить его на элемент perfect-а тоже оказалось не возможным
// т.к. все завязки на элемент внутри CdkVirtualScrollViewport приватные (в первую очередь байндинг CdkScrollable._elementScrolled)
// остается не применять директиву до тех пор пока не будет создан CdkVirtualScrollViewport на правильном элементе
// это приводит к тому что VirtualForOfDirective имеет отложенное действие и содержит CdkVirtualForOf а не является ей что было бы логичней
@Directive({
  selector: '[libVirtualFor][libVirtualForOf]'
})
export class VirtualForOfDirective<T> implements CollectionViewer, DoCheck, OnDestroy {

  constructor(
      public viewContainerRef: ViewContainerRef,
      public template: TemplateRef<CdkVirtualForOfContext<T>>,
      public differs: IterableDiffers,
      @SkipSelf() public viewport: VirtualScrollComponent,
      public ngZone: NgZone) {
    viewport.whenInited().subscribe(() => {
      this.originalDirective = new CdkVirtualForOf<T>(
        viewContainerRef,
        template,
        differs,
        viewport.scrollViewport,
        ngZone
      );
      this.viewChange.subscribe(this.originalDirective.viewChange);
      this.inited = true;
      this.libVirtualForOf = this.libVirtualForOfInternal;
      this.libVirtualForTrackBy = this.libVirtualForTrackByInternal;
      this.libVirtualForTemplate = this.libVirtualForTemplateInternal;
      this.libVirtualForTemplateCacheSize = this.libVirtualForTemplateCacheSizeInternal;
    });
  }

  public originalDirective: CdkVirtualForOf<T>;
  public inited = false;
  public libVirtualForOfInternal: DataSource<T> | Observable<T[]> | NgIterable<T>;
  public libVirtualForTrackByInternal: TrackByFunction<T> | undefined;
  public libVirtualForTemplateInternal: TemplateRef<CdkVirtualForOfContext<T>>;
  public libVirtualForTemplateCacheSizeInternal: number;
  public viewChange = new Subject<ListRange>();

  public ngDoCheck() {
    if (this.inited) {
      this.originalDirective.ngDoCheck();
    }
  }

  public ngOnDestroy() {
    if (this.inited) {
      this.originalDirective.ngOnDestroy();
    }
    this.viewChange.complete();
  }

  @Input()
  public get libVirtualForOf() {
    return this.libVirtualForOfInternal;
  }
  public set libVirtualForOf(libVirtualForOf: DataSource<T> | Observable<T[]> | NgIterable<T>) {
    this.libVirtualForOfInternal = libVirtualForOf;
    if (this.inited) {
      this.originalDirective.cdkVirtualForOf = libVirtualForOf;
    }
  }

  @Input()
  public get libVirtualForTrackBy() {
    return this.libVirtualForTrackByInternal;
  }
  public set libVirtualForTrackBy(libVirtualForTrackBy: TrackByFunction<T> | undefined) {
    this.libVirtualForTrackByInternal = libVirtualForTrackBy;
    if (this.inited) {
      this.originalDirective.cdkVirtualForTrackBy = libVirtualForTrackBy;
    }
  }

  @Input()
  public get libVirtualForTemplate() {
    return this.libVirtualForTemplateInternal;
  }
  public set libVirtualForTemplate(libVirtualForTemplate: TemplateRef<CdkVirtualForOfContext<T>>) {
    this.libVirtualForTemplateInternal = libVirtualForTemplate;
    if (this.inited) {
      this.originalDirective.cdkVirtualForTemplate = libVirtualForTemplate;
    }
  }

  @Input()
  public get libVirtualForTemplateCacheSize() {
    return this.libVirtualForTemplateCacheSizeInternal;
  }
  public set libVirtualForTemplateCacheSize(libVirtualForTemplateCacheSize: number) {
    this.libVirtualForTemplateCacheSizeInternal = libVirtualForTemplateCacheSize;
    if (this.inited) {
      this.originalDirective.cdkVirtualForTemplateCacheSize = libVirtualForTemplateCacheSize;
    }
  }

}
