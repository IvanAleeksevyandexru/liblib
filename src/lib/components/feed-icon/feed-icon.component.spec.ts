import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedIconComponent } from './feed-icon.component';

describe('FeedIconComponent', () => {
  let component: FeedIconComponent;
  let fixture: ComponentFixture<FeedIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
