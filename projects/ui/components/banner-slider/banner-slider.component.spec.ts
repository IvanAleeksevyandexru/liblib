import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, ViewChild } from '@angular/core';
import { SliderBannerComponent, DEFAULT_SLIDE_SHOW_INTERVAL } from './banner-slider.component';
import { StaticBannerComponent } from '../banner-static/banner-static.component';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { Banner, BannerGroup } from '../../models/main-page.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TestEvents } from '../../mocks/test-events-emulation.stub';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';

const TEST_BANNER_DATA = [
  new BannerGroup({
    group: 'bannerGroup1',
    banners: [
      new Banner({content: 'a', mnemonic: 'a', closable: true}),
      new Banner({mnemonic: 'b', content: 'b', closable: false}),
      new Banner({mnemonic: 'c', content: 'c', closable: true})
    ]
  }),
  new BannerGroup({
    group: 'bannerGroup2',
    banners: [
      new Banner({mnemonic: 'a', content: 'a2', closable: true}),
      new Banner({mnemonic: 'b', content: 'b2', closable: true})
    ]
  }),
  new BannerGroup({
    group: 'bannerGroup3',
    banners: [new Banner({mnemonic: 'd', content: 'd', closable: false})]
  }),
  new BannerGroup({
    group: 'bannerGroup4',
    banners: [new Banner({mnemonic: 'e', content: '<span><u>e</u></span>', closable: false})]
  })
];
const TEST_BANNER_DATA2 = [
  new BannerGroup({
    group: 'bannerGroup1',
    banners: [
      new Banner({mnemonic: 'x', content: 'x'}),
      new Banner({mnemonic: 'y', content: 'y'})
    ]
  })
];

function createComponent(groupName: string) {
  const fixture = TestBed.createComponent(SliderBannerComponent);
  const component = fixture.componentInstance;
  component.banners = TEST_BANNER_DATA;
  component.path = groupName;
  // component.showNavBtn = true;
  fixture.detectChanges();
  tick();
  fixture.detectChanges();
  return fixture;
}

function getVisibleBanners(fixture: ComponentFixture<any>) {
  const banners = fixture.nativeElement.querySelectorAll('.banner-wrapper');
  const visible = [];
  banners.forEach((banner) => {
    const bannerShiftFromFeedStart = banner.offsetLeft; // positive
    const feedViewportWidth = banner.parentElement.offsetWidth;
    const feedShift = banner.parentElement.offsetLeft; // negative
    const bannerWidth = banner.offsetWidth;
    const bannerLeftBorderPos = feedShift + bannerShiftFromFeedStart;
    const bannerRightBorderPos = feedShift + bannerShiftFromFeedStart + bannerWidth;
    if (bannerLeftBorderPos >= 0 && bannerLeftBorderPos < feedViewportWidth) {
      visible.push(banner);
    } else if (bannerRightBorderPos > 0 && bannerRightBorderPos <= feedViewportWidth) {
      visible.push(banner);
    }
  });
  return visible;
}

function getFirstVisible(fixture: ComponentFixture<any>) {
  const visible = getVisibleBanners(fixture);
  return visible.length ? visible[0] : null;
}

@Component({
  template: `<div style="width: 200px"><lib-slider-banner #sliderBanner [banners]="banners" path="bannerGroup1" [showNavBtn]="true"></lib-slider-banner></div>`
})
class FixedWidthSliderComponent {
  public banners = TEST_BANNER_DATA;
  @ViewChild('sliderBanner', {static: true})
  public sliderBanner: SliderBannerComponent;
}

@Component({
  template: `<lib-slider-banner [banners]="banners" path="bannerGroup1" [slideShow]="false" [showNavBtn]="true"></lib-slider-banner>`
})
class NoAnimationSliderComponent {
  public banners = TEST_BANNER_DATA;
}

describe('SliderBannerComponent', () => {
  let component: SliderBannerComponent;
  let fixture: ComponentFixture<SliderBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ NoopAnimationsModule, HttpClientTestingModule, ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ],
      declarations: [
        SliderBannerComponent, StaticBannerComponent, FixedWidthSliderComponent, NoAnimationSliderComponent, SafeHtmlPipe
      ]
    }).compileComponents();
  }));

  it('should create', () => {
    fixture = TestBed.createComponent(SliderBannerComponent);
    component = fixture.componentInstance;
    expect(component).not.toBeNull();
    component.cancelSlideShow();
  });

  it('should not keep active timers when destroyed', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    expect(1).toBe(1);
    fixture.destroy(); // will fail if active timers exists on exit
  }));

  it('should cyclically render banners from the group', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    // no need to wait for DEFAULT_SLIDE_TIME because with NoopAnimationsModule
    // animation onDone trigger emits immediately right in current tick
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    component.cancelSlideShow();
  }));

  it('should cyclically render banners from group of size 2', fakeAsync(() => {
    fixture = createComponent('bannerGroup2');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a2');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b2');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a2');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b2');
    component.cancelSlideShow();
  }));

  it('should render single banner without animation and controls if one only available', fakeAsync(() => {
    fixture = createComponent('bannerGroup3');
    component = fixture.componentInstance;
    const prevBanner = spyOn(component, 'prevBanner').and.callThrough();
    const nextBanner = spyOn(component, 'nextBanner').and.callThrough();
    expect(fixture.nativeElement.querySelectorAll('.banner-wrapper').length).toBe(1);
    expect(fixture.nativeElement.querySelector('.banner-wrapper .banner-content').textContent).toBe('d');
    expect(fixture.nativeElement.querySelector('.sliders-controls')).toBeNull();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.banner-wrapper .banner-content').textContent).toBe('d');
    expect(prevBanner).not.toHaveBeenCalled();
    expect(nextBanner).not.toHaveBeenCalled();
    component.cancelSlideShow();
  }));

  it('should let navigate to any particular banner on users choise manually', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    const selectors = fixture.nativeElement.querySelectorAll('.banners-selector .banners-item');
    expect(selectors.length).toBe(3);
    expect(selectors[0].classList.contains('selected')).toBeTruthy();
    selectors[2].click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(selectors[0].classList.contains('selected')).toBeFalsy();
    expect(selectors[2].classList.contains('selected')).toBeTruthy();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    selectors[1].click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(selectors[2].classList.contains('selected')).toBeFalsy();
    expect(selectors[1].classList.contains('selected')).toBeTruthy();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
  }));

  it('should stop cyclic animation on users navigation', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    const selectors = fixture.nativeElement.querySelectorAll('.banners-selector .banners-item');
    selectors[1].click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    const prevBanner = spyOn(component, 'prevBanner').and.callThrough();
    const nextBanner = spyOn(component, 'nextBanner').and.callThrough();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    expect(prevBanner).not.toHaveBeenCalled();
    expect(nextBanner).not.toHaveBeenCalled();
  }));

  it('should let manually list banners feed in cycle with array infinite left shift', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    const prevBanner = fixture.nativeElement.querySelector('.banners-paging .prev-banner');
    prevBanner.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    prevBanner.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
  }));

  it('should let manually list banners feed in cycle with array infinite right shift', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    const nextBanner = fixture.nativeElement.querySelector('.banners-paging .next-banner');
    nextBanner.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    nextBanner.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
  }));

  it('should stop cyclic feed animation after user manually navigates prev/next', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    const nextBannerButton = fixture.nativeElement.querySelector('.banners-paging .next-banner');
    nextBannerButton.click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    const prevBanner = spyOn(component, 'prevBanner').and.callThrough();
    const nextBanner = spyOn(component, 'nextBanner').and.callThrough();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    expect(prevBanner).not.toHaveBeenCalled();
    expect(nextBanner).not.toHaveBeenCalled();
  }));

  it('should take the full width of the element it is contained in', fakeAsync(() => {
    // this test is required for further swipe tests math correctness
    const fixedWidthFixture = TestBed.createComponent(FixedWidthSliderComponent);
    const fixedWidthComponent = fixedWidthFixture.componentInstance.sliderBanner;
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    const bannerContainer = fixedWidthFixture.nativeElement.querySelector('.banners-feed-container');
    expect(bannerContainer.getBoundingClientRect().width).toBe(200); // set by style
    const activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.getBoundingClientRect().width).toBe(200);
    fixedWidthComponent.cancelSlideShow();
  }));

  it('should let swipe banner with touch to the left', fakeAsync(() => {
    const fixedWidthFixture = TestBed.createComponent(FixedWidthSliderComponent);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    let activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
    TestEvents.swipeLeft(activeBanner, 200);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('b');
    TestEvents.swipeLeft(activeBanner, 140);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('c');
  }));

  it('should let swipe banner with touch to the right', fakeAsync(() => {
    const fixedWidthFixture = TestBed.createComponent(FixedWidthSliderComponent);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    let activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
    TestEvents.swipeRight(activeBanner, 200);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('c');
    TestEvents.swipeRight(activeBanner, 140);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('b');
  }));

  it('should follow the finger (drag-drop, scroll to the same offset) when touched', fakeAsync(() => {
    const fixedWidthFixture = TestBed.createComponent(FixedWidthSliderComponent);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    let activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
    const bannersFeed = fixedWidthFixture.nativeElement.querySelector('.banners-feed');
    const initialOffset = parseInt(bannersFeed.style.left, 10);
    TestEvents.swipeLeft(activeBanner, 200, () => {
      // in-the-middle check
      fixedWidthFixture.detectChanges();
      expect(parseInt(bannersFeed.style.left, 10)).toBe(initialOffset - 100);
      expect(getVisibleBanners(fixedWidthFixture).length).toBe(2);
    });
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('b');
  }));

  it('should adjust (center) the view to the closest banner when drag-drop ends', fakeAsync(() => {
    const fixedWidthFixture = TestBed.createComponent(FixedWidthSliderComponent);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    const bannersFeed = fixedWidthFixture.nativeElement.querySelector('.banners-feed');
    let activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
    TestEvents.swipeLeft(activeBanner, 20); // less than a half of a banner width
    fixedWidthFixture.detectChanges();
    expect(getVisibleBanners(fixedWidthFixture).length).toBe(2);
    tick();
    fixedWidthFixture.detectChanges();
    expect(getVisibleBanners(fixedWidthFixture).length).toBe(1);
    let offset = parseInt(bannersFeed.style.left, 10);
    expect(offset % 200).toBe(0); // banner centered, 20px drag-drop leveled (adjusted to the current banner)
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
    TestEvents.swipeRight(activeBanner, 130); // more than a half of a banner width
    fixedWidthFixture.detectChanges();
    expect(getVisibleBanners(fixedWidthFixture).length).toBe(2);
    tick();
    fixedWidthFixture.detectChanges();
    expect(getVisibleBanners(fixedWidthFixture).length).toBe(1);
    offset = parseInt(bannersFeed.style.left, 10);
    expect(offset % 200).toBe(0);
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('c');
    TestEvents.swipeLeft(activeBanner, 250); // complete banner width + 50px more
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    offset = parseInt(bannersFeed.style.left, 10);
    expect(offset % 200).toBe(0);
    activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
  }));

  it('should let release the finger without swiping', fakeAsync(() => {
    const fixedWidthFixture = TestBed.createComponent(FixedWidthSliderComponent);
    fixedWidthFixture.detectChanges();
    tick();
    fixedWidthFixture.detectChanges();
    const bannersFeed = fixedWidthFixture.nativeElement.querySelector('.banners-feed');
    const activeBanner = getFirstVisible(fixedWidthFixture);
    expect(activeBanner.textContent).toBe('a');
    TestEvents.swipeRight(activeBanner, 10);
    fixedWidthFixture.detectChanges();
    expect(getVisibleBanners(fixedWidthFixture).length).toBe(2);
    tick();
    fixedWidthFixture.detectChanges();
    expect(getVisibleBanners(fixedWidthFixture).length).toBe(1);
    expect(getFirstVisible(fixedWidthFixture).textContent).toBe('a');
  }));

  it('should stop cyclic animation when swiped', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    let activeBanner = getFirstVisible(fixture);
    expect(activeBanner.textContent).toBe('b');
    TestEvents.swipeRight(activeBanner, 10);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(getVisibleBanners(fixture).length).toBe(1);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    activeBanner = getFirstVisible(fixture);
    expect(activeBanner.textContent).toBe('b');
  }));

  it('should render and apply stylistic properties', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    const bannersContainer = fixture.nativeElement.querySelector('.banner-group-container');
    expect(bannersContainer.classList.contains('no-border')).toBeTruthy();
    expect(bannersContainer.classList.contains('no-border-radius')).toBeTruthy();
    expect(bannersContainer.style.height).toBe('');
    let visible = getFirstVisible(fixture);
    component.noBorder = false;
    component.noBorderRadius = false;
    component.fixedHeight = 320;
    fixture.detectChanges();
    expect(bannersContainer.classList.contains('no-border')).toBeFalsy();
    expect(bannersContainer.classList.contains('no-border-radius')).toBeFalsy();
    expect(bannersContainer.style.height).toBe('320px');
    visible = getFirstVisible(fixture);
    component.cancelSlideShow();
  }));

  it('should refresh and rerun animation when group changed', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    const nextBanner = fixture.nativeElement.querySelector('.banners-paging .next-banner');
    nextBanner.click();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL); // animation stoped
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    component.path = 'bannerGroup2';
    component.update();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a2');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b2');
    component.cancelSlideShow();
  }));

  it('should refresh and rerun animation when banners source changed', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    const nextBanner = fixture.nativeElement.querySelector('.banners-paging .next-banner');
    nextBanner.click();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL); // animation stoped
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    component.banners = TEST_BANNER_DATA2;
    component.update();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('x');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('y');
    component.cancelSlideShow();
  }));

  it('should disable animation initially if disabled by slideShow', fakeAsync(() => {
    const noAnimationFixture = TestBed.createComponent(NoAnimationSliderComponent);
    noAnimationFixture.detectChanges();
    tick();
    noAnimationFixture.detectChanges();
    let visible = getFirstVisible(noAnimationFixture);
    expect(visible.textContent).toBe('a');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    noAnimationFixture.detectChanges();
    visible = getFirstVisible(noAnimationFixture);
    expect(visible.textContent).toBe('a');
  }));

  it('should respect slideShowReverse animation property', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    component.slideShowReverse = true;
    fixture.detectChanges();
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    component.cancelSlideShow();
  }));

  it('should respect custom slideShowInterval', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    component.slideShowInterval = DEFAULT_SLIDE_SHOW_INTERVAL * 2;
    component.update();
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    component.cancelSlideShow();
  }));

  it('should not escape html', fakeAsync(() => {
    fixture = createComponent('bannerGroup4');
    component = fixture.componentInstance;
    const visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('e');
    component.cancelSlideShow();
  }));

  it('should let bind closable property directly', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    component.closable = true;
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.banner-group-container').offsetWidth).toBe(0);
  }));

  it('should take closable property from banner model if not set directly', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    let closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton).toBeNull();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    component.cancelSlideShow();
  }));

  it('should override banner mobel closable value by direct set', fakeAsync(() => {
    fixture = createComponent('bannerGroup3');
    component = fixture.componentInstance;
    component.closable = true;
    component.update();
    const visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('d');
    const closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.banner-group-container').offsetWidth).toBe(0);
  }));

  it('should exclude active banner if is is closable and direct closable not overrides it', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a');
    let closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton).toBeNull();
    expect(fixture.nativeElement.querySelector('.banner-group-container').offsetWidth).not.toBe(0);
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('c');
    closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton).toBeNull();
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b');
    component.cancelSlideShow();
  }));

  it('should close banner completely if closable overrides', fakeAsync(() => {
    fixture = createComponent('bannerGroup1');
    component = fixture.componentInstance;
    component.closable = true;
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.banner-group-container').offsetWidth).toBe(0);
  }));

  it('should close banner completely if last closable active banner is closed', fakeAsync(() => {
    fixture = createComponent('bannerGroup2');
    component = fixture.componentInstance;
    let visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a2');
    tick(DEFAULT_SLIDE_SHOW_INTERVAL);
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('b2');
    const closeButton = fixture.nativeElement.querySelector('.close-banner-group');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click();
    fixture.detectChanges();
    visible = getFirstVisible(fixture);
    expect(visible.textContent).toBe('a2');
    expect(closeButton.offsetWidth).not.toBe(0);
    closeButton.click(); // last closable banner closed
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.banner-group-container').offsetWidth).toBe(0);
  }));

});
