import { TestBed, ComponentFixture, async, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { PagingControlsComponent } from './paging-controls.component';

@Component({
  template: `<lib-paging-controls #controls [count]="count" [activePage]="activePage"
      (pageChanged)="switchPage($event.page)"></lib-paging-controls>`
})
class CommonParentComponent {
  public activePage = 1;
  public count = 50;
  @ViewChild('controls', {static: true}) public controls: PagingControlsComponent;
  public switchPage(value: number) {
    this.activePage = value;
  }
}

@Component({
  template: `<lib-paging-controls #controls [count]="count" [pageSize]="pageSize" [activePage]="activePage"
      (pageChanged)="switchPage($event.page)"></lib-paging-controls>`
})
class CustomPageSizeParentComponent {
  public activePage = 1;
  public count = 55;
  public pageSize = 23;
  @ViewChild('controls', {static: true}) public controls: PagingControlsComponent;
  public switchPage(value: number) {
    this.activePage = value;
  }
}

@Component({
  template: `<lib-paging-controls #controls [count]="count" [activePage]="activePage"
      (pageChanged)="switchPage($event.page)"></lib-paging-controls>`
})
class CustomInitialPageParentComponent {
  public activePage = 2;
  public count = 50;
  @ViewChild('controls', {static: true}) public controls: PagingControlsComponent;
  public switchPage(value: number) {
    this.activePage = value;
  }
}

@Component({
  template: `<lib-paging-controls #controls [count]="count" [activePage]="activePage"
      (pageChanged)="switchPage($event.page)"></lib-paging-controls>`
})
class CustomInvalidInitialPageParentComponent {
  public activePage = 4;
  public count = 50;
  @ViewChild('controls', {static: true}) public controls: PagingControlsComponent;
  public switchPage(value: number) {
    this.activePage = value;
  }
}

@Component({
  template: `<lib-paging-controls #controls [count]="count" [activePage]="activePage"
      (pageChanged)="switchPage($event.page)"></lib-paging-controls>`
})
class RejectingParentComponent {
  public activePage = 1;
  public count = 50;
  @ViewChild('controls', {static: true}) public controls: PagingControlsComponent;
  public switchPage(value: number) {
    // ignore page change request
  }
}

@Component({
  template: `<lib-paging-controls #controls [count]="count" [activePage]="activePage"
      (pageChanged)="switchPage($event.page)"></lib-paging-controls>`
})
class PostponingParentComponent {
  public activePage = 1;
  public count = 50;
  @ViewChild('controls', {static: true}) public controls: PagingControlsComponent;
  public switchPage(value: number) {
    setTimeout(() => {
      this.activePage = value;
    }, 100);
  }
}

function wait(fixture: ComponentFixture<any>) {
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
}

describe('PagingControlsComponent', () => {
  let component: CommonParentComponent;
  let fixture: ComponentFixture<CommonParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PagingControlsComponent, CommonParentComponent, CustomPageSizeParentComponent,
        CustomInitialPageParentComponent, CustomInvalidInitialPageParentComponent,
        RejectingParentComponent, PostponingParentComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(CommonParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should define pages count according to list size and page size', () => {
    const pagingFixture = TestBed.createComponent(PagingControlsComponent);
    const pagingComponent = pagingFixture.componentInstance;
    pagingComponent.count = 59;
    pagingComponent.pageSize = 15;
    pagingComponent.update();
    expect(pagingComponent.lastPage).toBe(4);
    pagingComponent.count = 60;
    pagingComponent.update();
    expect(pagingComponent.lastPage).toBe(4);
    pagingComponent.count = 61;
    pagingComponent.update();
    expect(pagingComponent.lastPage).toBe(5);
    pagingComponent.count = 0;
    pagingComponent.update();
    expect(pagingComponent.lastPage).toBe(1);
  });

  it('should bind to parents view active page property and follow it', fakeAsync(() => {
    const change = spyOn(fixture.componentInstance, 'switchPage').and.callThrough();
    expect(component.controls.lastPage).toBe(3);
    expect(component.controls.currentPage).toBe(1);
    component.activePage = 2;
    wait(fixture);
    expect(component.controls.currentPage).toBe(2);
    expect(change).not.toHaveBeenCalled();
  }));

  it('should catch up initial parents view active page and bind to it without reverting request', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(CustomInitialPageParentComponent);
    const hostComponent = hostFixture.componentInstance;
    const change = spyOn(hostComponent, 'switchPage').and.callThrough();
    wait(hostFixture);
    expect(hostComponent.controls.currentPage).toBe(2);
    expect(hostComponent.activePage).toBe(2);
    expect(change).not.toHaveBeenCalled();
  }));

  it('should not trust initial parents view active page and commit back if it is out of range', fakeAsync(() => {
    const hostFixture = TestBed.createComponent(CustomInvalidInitialPageParentComponent);
    const hostComponent = hostFixture.componentInstance;
    const change = spyOn(hostComponent, 'switchPage').and.callThrough();
    wait(hostFixture);
    expect(hostComponent.controls.currentPage).toBe(1);
    expect(hostComponent.activePage).toBe(1);
    expect(change).toHaveBeenCalled();
  }));

  it('should react to list size change without active page reset request if active page still valid', fakeAsync(() => {
    component.switchPage(2);
    fixture.detectChanges();
    const change = spyOn(component, 'switchPage').and.callThrough();
    expect(component.controls.lastPage).toBe(3);
    component.count = 65;
    wait(fixture);
    expect(component.controls.lastPage).toBe(4);
    expect(change).not.toHaveBeenCalled();
    expect(component.activePage).toBe(2);
    expect(component.controls.currentPage).toBe(2);
  }));

  it('should react to list size change with active page reset request if it becomes invalid', fakeAsync(() => {
    component.switchPage(3);
    fixture.detectChanges();
    const change = spyOn(component, 'switchPage').and.callThrough();
    expect(component.controls.lastPage).toBe(3);
    component.count = 35;
    wait(fixture);
    expect(component.controls.lastPage).toBe(2);
    expect(change).toHaveBeenCalledTimes(1);
    expect(component.activePage).toBe(1);
    expect(component.controls.currentPage).toBe(1);
  }));

  it('should react to pageSize change without active page reset request if active page still valid', fakeAsync(() => {
    const pageFixture = TestBed.createComponent(CustomPageSizeParentComponent);
    const pageComponent = pageFixture.componentInstance;
    pageFixture.detectChanges();
    pageComponent.switchPage(2);
    pageFixture.detectChanges();
    const change = spyOn(pageComponent, 'switchPage').and.callThrough();
    expect(pageComponent.controls.lastPage).toBe(3);
    pageComponent.pageSize = 13;
    pageComponent.controls.update();
    wait(pageFixture);
    expect(pageComponent.controls.lastPage).toBe(5);
    expect(change).not.toHaveBeenCalled();
    expect(pageComponent.activePage).toBe(2);
    expect(pageComponent.controls.currentPage).toBe(2);
  }));

  it('should react to pageSize change with active page reset request if it becomes invalid', fakeAsync(() => {
    const pageFixture = TestBed.createComponent(CustomPageSizeParentComponent);
    const pageComponent = pageFixture.componentInstance;
    pageFixture.detectChanges();
    pageComponent.switchPage(3);
    pageFixture.detectChanges();
    const change = spyOn(pageComponent, 'switchPage').and.callThrough();
    expect(pageComponent.controls.lastPage).toBe(3);
    pageComponent.pageSize = 28;
    pageComponent.controls.update();
    wait(pageFixture);
    expect(pageComponent.controls.lastPage).toBe(2);
    expect(change).toHaveBeenCalledTimes(1);
    expect(pageComponent.activePage).toBe(1);
    expect(pageComponent.controls.currentPage).toBe(1);
  }));

  it('should emit active page change request when user navigates to any page', fakeAsync(() => {
    const pageRequest = spyOn(component, 'switchPage').and.callThrough();
    const next = fixture.nativeElement.querySelector('.next-page .page-ref');
    next.click();
    wait(fixture);
    expect(component.activePage).toBe(2);
    expect(pageRequest).toHaveBeenCalledTimes(1);
    const last = fixture.nativeElement.querySelector('.last-page .page-ref');
    last.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
    expect(pageRequest).toHaveBeenCalledTimes(2);
  }));

  it('should let navigate with prev and next buttons till the end', fakeAsync(() => {
    const prevButton = fixture.nativeElement.querySelector('.prev-page .page-ref');
    const nextButton = fixture.nativeElement.querySelector('.next-page .page-ref');
    expect(component.activePage).toBe(1);
    expect(component.controls.lastPage).toBe(3);
    expect(prevButton.parentElement.classList.contains('disabled')).toBeTruthy();
    expect(nextButton.parentElement.classList.contains('disabled')).toBeFalsy();
    prevButton.click();
    wait(fixture);
    expect(component.activePage).toBe(1);
    nextButton.click();
    wait(fixture);
    expect(component.activePage).toBe(2);
    expect(prevButton.parentElement.classList.contains('disabled')).toBeFalsy();
    expect(nextButton.parentElement.classList.contains('disabled')).toBeFalsy();
    nextButton.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
    expect(prevButton.parentElement.classList.contains('disabled')).toBeFalsy();
    expect(nextButton.parentElement.classList.contains('disabled')).toBeTruthy();
    nextButton.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
  }));

  it('should hide prev and next buttons if prevNextButtons flag disabled', fakeAsync(() => {
    expect(fixture.nativeElement.querySelector('.prev-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.next-page')).not.toBeNull();
    component.controls.prevNextButtons = false;
    wait(fixture);
    expect(fixture.nativeElement.querySelector('.prev-page')).toBeNull();
    expect(fixture.nativeElement.querySelector('.next-page')).toBeNull();
  }));

  it('should let navigate to first/last pages using correspondent buttons', fakeAsync(() => {
    const nextButton = fixture.nativeElement.querySelector('.next-page .page-ref');
    const firstButton = fixture.nativeElement.querySelector('.first-page .page-ref');
    const lastButton = fixture.nativeElement.querySelector('.last-page .page-ref');
    expect(component.activePage).toBe(1);
    expect(component.controls.lastPage).toBe(3);
    expect(firstButton.parentElement.classList.contains('disabled')).toBeTruthy();
    expect(lastButton.parentElement.classList.contains('disabled')).toBeFalsy();
    firstButton.click();
    wait(fixture);
    expect(component.activePage).toBe(1);
    nextButton.click();
    wait(fixture);
    expect(component.activePage).toBe(2);
    expect(firstButton.parentElement.classList.contains('disabled')).toBeFalsy();
    expect(lastButton.parentElement.classList.contains('disabled')).toBeFalsy();
    lastButton.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
    expect(firstButton.parentElement.classList.contains('disabled')).toBeFalsy();
    expect(lastButton.parentElement.classList.contains('disabled')).toBeTruthy();
    lastButton.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
    firstButton.click();
    wait(fixture);
    expect(component.activePage).toBe(1);
    expect(firstButton.parentElement.classList.contains('disabled')).toBeTruthy();
    expect(lastButton.parentElement.classList.contains('disabled')).toBeFalsy();
  }));

  it('should hide first and last buttons if tailButtons flag disabled', fakeAsync(() => {
    expect(fixture.nativeElement.querySelector('.first-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.last-page')).not.toBeNull();
    component.controls.tailButtons = false;
    wait(fixture);
    expect(fixture.nativeElement.querySelector('.first-page')).toBeNull();
    expect(fixture.nativeElement.querySelector('.last-page')).toBeNull();
  }));

  it('should render tail pages in numeric block', fakeAsync(() => {
    component.controls.numericButtonsNeighboursThreshold = 0; // disable neighboor pages render
    component.count = 350; // by 20
    component.controls.update();
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(18);
    expect(numeric.textContent).toBe('1...18');
    expect(component.activePage).toBe(1);
    const tailLast = fixture.nativeElement.querySelector('.page-controls .page-item a.page-ref');
    expect(tailLast.textContent).toBe('18');
    tailLast.click();
    wait(fixture);
    expect(component.activePage).toBe(18);
    const tailFirst = fixture.nativeElement.querySelector('.page-controls .page-item a.page-ref');
    expect(tailFirst.textContent).toBe('1');
    tailFirst.click();
    wait(fixture);
    expect(component.activePage).toBe(1);
  }));

  it('should show exactly numericButtonsTailsThreshold quantity of tail elements', fakeAsync(() => {
    component.controls.numericButtonsNeighboursThreshold = 0; // disable neighboor pages render
    component.controls.numericButtonsTailsThreshold = 3;
    component.controls.update();
    component.count = 350; // by 20
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(18);
    expect(numeric.textContent).toBe('123...161718');
    component.switchPage(8);
    wait(fixture);
    expect(numeric.textContent).toBe('123...8...161718');
    component.controls.numericButtonsTailsThreshold = 0;
    component.controls.update();
    wait(fixture);
    expect(numeric.textContent).toBe('8');
  }));

  it('should not duplicate intercepting tail pages', fakeAsync(() => {
    component.controls.numericButtonsNeighboursThreshold = 0; // disable neighboor pages render
    component.controls.numericButtonsTailsThreshold = 1;
    component.controls.update();
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(3);
    expect(numeric.textContent).toBe('1...3');
    component.controls.numericButtonsTailsThreshold = 2;
    component.controls.update();
    wait(fixture);
    expect(numeric.textContent).toBe('123');
  }));

  it('should allways show active page in addition to tail pages', fakeAsync(() => {
    component.controls.numericButtonsNeighboursThreshold = 0; // disable neighboor pages render
    component.controls.numericButtonsTailsThreshold = 1;
    component.count = 150; // by 20
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(8);
    expect(numeric.textContent).toBe('1...8');
    component.switchPage(2);
    wait(fixture);
    expect(numeric.textContent).toBe('12...8');
    const nextButton = fixture.nativeElement.querySelector('.next-page .page-ref');
    nextButton.click();
    wait(fixture);
    expect(numeric.textContent).toBe('1...3...8');
    component.controls.numericButtonsTailsThreshold = 2;
    component.switchPage(7);
    wait(fixture);
    expect(numeric.textContent).toBe('12...78');
  }));

  it('should not navigate to page if it is already current one opened', fakeAsync(() => {
    const change = spyOn(component, 'switchPage').and.callThrough();
    expect(component.activePage).toBe(1);
    let currentPage = fixture.nativeElement.querySelector('.page-controls .current-page .page-ref');
    currentPage.click();
    wait(fixture);
    expect(component.activePage).toBe(1);
    expect(change).not.toHaveBeenCalled();
    const lastButton = fixture.nativeElement.querySelector('.last-page .page-ref');
    lastButton.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
    expect(change).toHaveBeenCalledTimes(1);
    currentPage = fixture.nativeElement.querySelector('.page-controls .current-page .page-ref');
    currentPage.click();
    wait(fixture);
    expect(component.activePage).toBe(3);
    expect(change).toHaveBeenCalledTimes(1);
  }));

  it('should show active pages neighboors', fakeAsync(() => {
    component.count = 150; // by 20
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(8);
    expect(component.activePage).toBe(1);
    expect(numeric.textContent).toBe('12...8');
    component.switchPage(5);
    wait(fixture);
    expect(numeric.textContent).toBe('1...456...8');
    component.switchPage(8);
    wait(fixture);
    expect(numeric.textContent).toBe('1...78');
  }));

  it('should show neighboor pages in the amount of numericButtonsNeighboursThreshold', fakeAsync(() => {
    component.count = 350; // by 20
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(18);
    expect(component.activePage).toBe(1);
    expect(numeric.textContent).toBe('12...18');
    component.switchPage(8);
    wait(fixture);
    expect(numeric.textContent).toBe('1...789...18');
    component.controls.numericButtonsNeighboursThreshold = 0;
    component.controls.update();
    wait(fixture);
    expect(numeric.textContent).toBe('1...8...18');
    component.controls.numericButtonsNeighboursThreshold = 3;
    component.controls.update();
    wait(fixture);
    expect(numeric.textContent).toBe('1...567891011...18');
  }));

  it('should not duplicate tail & neighboor pages if intercepting', fakeAsync(() => {
    component.count = 150; // by 20
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(8);
    expect(numeric.textContent).toBe('12...8');
    component.switchPage(2);
    wait(fixture);
    expect(numeric.textContent).toBe('123...8');
    component.switchPage(7);
    wait(fixture);
    expect(numeric.textContent).toBe('1...678');
  }));

  it('should show separators between non-neighboor pages rendered', fakeAsync(() => {
    component.count = 150; // by 20
    wait(fixture);
    const numeric = fixture.nativeElement.querySelector('.page-controls');
    expect(component.controls.lastPage).toBe(8);
    expect(numeric.textContent).toBe('12...8');
    component.switchPage(3);
    wait(fixture);
    expect(numeric.textContent).toBe('1234...8');
    component.switchPage(5);
    wait(fixture);
    expect(numeric.textContent).toBe('1...456...8');
    expect(fixture.nativeElement.querySelectorAll('.page-controls .page-item .separator').length).toBe(2);
    const separator = fixture.nativeElement.querySelector('.page-controls .page-item .separator');
    const pageRequest = spyOn(component, 'switchPage').and.callThrough();
    separator.click();
    expect(pageRequest).not.toHaveBeenCalled();
  }));

  it('should hide all numeric page navigation if numericButtons deactivated', fakeAsync(() => {
    component.controls.numericButtons = false;
    wait(fixture);
    expect(fixture.nativeElement.querySelector('.first-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.last-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.prev-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.next-page')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.numeric-pages')).toBeNull();
  }));

  it('should skip/ignore active page change request if outer logic rejects it', fakeAsync(() => {
    const rejectingFixture = TestBed.createComponent(RejectingParentComponent);
    const rejectingInstance = rejectingFixture.componentInstance;
    wait(rejectingFixture);
    expect(rejectingInstance.activePage).toBe(1);
    const pageRequest = spyOn(rejectingInstance, 'switchPage').and.callThrough();
    const next = rejectingFixture.nativeElement.querySelector('.next-page .page-ref');
    next.click();
    wait(rejectingFixture);
    expect(pageRequest).toHaveBeenCalled();
    expect(rejectingInstance.activePage).toBe(1);
    expect(rejectingInstance.controls.currentPage).toBe(1);
  }));

  it('should let postpone/delay active page changing after active page change request signal is sent', fakeAsync(() => {
    const postponingFixture = TestBed.createComponent(PostponingParentComponent);
    const postponingInstance = postponingFixture.componentInstance;
    wait(postponingFixture);
    expect(postponingInstance.activePage).toBe(1);
    const pageRequest = spyOn(postponingInstance, 'switchPage').and.callThrough();
    const next = postponingFixture.nativeElement.querySelector('.next-page .page-ref');
    next.click();
    wait(postponingFixture);
    expect(pageRequest).toHaveBeenCalled();
    expect(postponingInstance.activePage).toBe(1);
    expect(postponingInstance.controls.currentPage).toBe(1);
    tick(100);
    postponingFixture.detectChanges();
    expect(postponingInstance.activePage).toBe(2);
    expect(postponingInstance.controls.currentPage).toBe(2);
  }));

});
