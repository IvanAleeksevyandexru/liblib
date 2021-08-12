import { HighlightPipe } from './highlight.pipe';
import {inject, TestBed} from '@angular/core/testing';
import {BrowserModule, DomSanitizer} from '@angular/platform-browser';

describe('HighlightPipe', () => {
  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          BrowserModule
        ]
      });
  });

  it('create an instance', inject([DomSanitizer], (domSanitizer: DomSanitizer) => {
    const pipe = new HighlightPipe(domSanitizer);
    expect(pipe).toBeTruthy();
  }));
});
