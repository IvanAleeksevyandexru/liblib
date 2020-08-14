import {TestBed} from '@angular/core/testing';

import {LoadAsyncStaticService} from './load-async-static.service';

describe('LoadAsyncStaticService', () => {

  let service: LoadAsyncStaticService;
  const gosbarUrl = '//gosbar-dev.test.gosuslugi.ru/widget/widget.js';

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    service = TestBed.get(LoadAsyncStaticService);
    expect(service).toBeTruthy();
  });

  it('get callback after script loaded', () => {
    service = TestBed.get(LoadAsyncStaticService);
    let isLoaded = false;
    service.loadScriptAsync(gosbarUrl, false, () => {
      isLoaded = true;
      expect(isLoaded).toBeTruthy();
    });
  });

});
