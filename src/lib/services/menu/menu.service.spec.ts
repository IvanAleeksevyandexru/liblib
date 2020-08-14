import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [{ provide: LoadService, useClass: LoadServiceStub }]
    });

    service = TestBed.get(MenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default links', () => {
    const defaultLinks = [{
      url: '/category',
      title: 'HEADER.MENU.SERVICES',
      listeners: true
    }, {
      url: '/pay',
      title: 'HEADER.MENU.PAYMENT'
    }, {
      url: '/help',
      title: 'HEADER.MENU.SUPPORT'
    }];

    expect(JSON.stringify(service.getLinks())).toEqual(JSON.stringify(defaultLinks));
  });

  it('should return static urls for menu items', () => {
    const staticUrls = service.getStaticItemUrls();
    expect(staticUrls['HEADER.MENU.LOGIN_ORG']).toContain('/roles');
  });
});
