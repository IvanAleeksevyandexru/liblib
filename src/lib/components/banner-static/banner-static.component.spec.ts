import { ComponentFixture, TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StaticBannerComponent } from './banner-static.component';
import { LoadService } from '../../services/load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { Banner, BannerGroup } from '../../models/main-page.model';
import { SafeHtmlPipe } from '../../pipes/safe-html/safe-html.pipe';

const TEST_BANNER_DATA = [
  new BannerGroup({
    group: 'bannerGroup1',
    banners: [
      new Banner({
        content: 'a',
        mnemonic: 'a',
        closable: true
      }),
      new Banner({
        mnemonic: 'b',
        content: '<span><u>b</u></span>',
        closable: false
      })
    ]
  }),
  new BannerGroup({
    group: 'bannerGroup2',
    banners: [
      new Banner({
        mnemonic: 'a',
        content: 'a2'
      })
    ]
  })
];

describe('StaticBannerComponent', () => {
  let component: StaticBannerComponent;
  let fixture: ComponentFixture<StaticBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: LoadService, useClass: LoadServiceStub }
      ],
      declarations: [ StaticBannerComponent, SafeHtmlPipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render specified banner content', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('a');
    const container = fixture.nativeElement.querySelector('.banner-container');
    expect(container.offsetWidth).not.toBe(0);
  });

  it('should render single banner in a group without mnemonic specification', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup2';
    component.update();
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('a2');
  });

  it('should not escape html', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.b';
    component.update();
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('b');
  });

  it('should react if binded group changed', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    let content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('a');
    component.path = 'bannerGroup2.a';
    component.update();
    fixture.detectChanges();
    content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('a2');
  });

  it('should react if specified mnemonic changed', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    let content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('a');
    component.path = 'bannerGroup1.b';
    component.update();
    fixture.detectChanges();
    content = fixture.nativeElement.querySelector('.banner-content');
    expect(content.textContent).toBe('b');
  });

  it('should render correspondent style properties', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    const bannersContainer = fixture.nativeElement.querySelector('.banner-container');
    expect(bannersContainer.classList.contains('no-border')).toBeTruthy();
    expect(bannersContainer.classList.contains('no-border-radius')).toBeTruthy();
    expect(bannersContainer.classList.contains('bottom-padding')).toBeFalsy();
    expect(bannersContainer.style.height).toBe('');
    component.noBorder = false;
    component.noBorderRadius = false;
    component.fixedHeight = 320;
    fixture.detectChanges();
    expect(bannersContainer.classList.contains('no-border')).toBeFalsy();
    expect(bannersContainer.classList.contains('no-border-radius')).toBeFalsy();
    expect(bannersContainer.style.height).toBe('320px');
  });

  it('should let bind closable property directly', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.b';
    component.closable = true;
    component.update();
    fixture.detectChanges();
    let closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).not.toBeNull();
    component.closable = false;
    component.update();
    fixture.detectChanges();
    closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).toBeNull();
  });

  it('should take closable property from banner model if not set directly', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    let closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).not.toBeNull();
    component.path = 'bannerGroup1.b';
    component.update();
    fixture.detectChanges();
    closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).toBeNull();
  });

  it('should override banner mobel closable value by direct set', () => {
    component.banners = TEST_BANNER_DATA;
    component.closable = false;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    let closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).toBeNull();
    component.closable = true;
    component.path = 'bannerGroup1.b';
    component.update();
    fixture.detectChanges();
    closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).not.toBeNull();
  });

  it('should let close banner by user', () => {
    component.banners = TEST_BANNER_DATA;
    component.path = 'bannerGroup1.a';
    component.update();
    fixture.detectChanges();
    const closeButton = fixture.nativeElement.querySelector('.close-banner');
    expect(closeButton).not.toBeNull();
    closeButton.click();
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.banner-container');
    expect(container.offsetWidth).toBe(0);
    expect(container.classList.contains('hidden')).toBeTruthy();
  });
});
