import { TestBed } from '@angular/core/testing';

import { BreadcrumbsService } from './breadcrumbs.service';

describe('BreadcrumbsService', () => {
  let service: BreadcrumbsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.get(BreadcrumbsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set links', () => {
    service.setLinks([{
      url: '/',
      name: 'Главная'
    }, {
      url: '/category',
      name: 'Услуги'
    }]);

    expect(service.getLinks().length).toEqual(2);
  });

  it('should remove links', () => {
    service.remove();

    expect(service.getLinks().length).toEqual(0);
  });
});
