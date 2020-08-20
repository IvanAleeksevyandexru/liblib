import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { LoadService } from '../load/load.service';
import { LoadServiceStub } from '../../mocks/load.service.stub';
import { ConstantsService } from '../constants.service';

describe('ProfileService', () => {

  let service: ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConstantsService, { provide: LoadService, useClass: LoadServiceStub }]
    });

    service = TestBed.inject(ProfileService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create InfoCardView for doc with type RF_PASSPORT', () => {
    const cardView = service.createCardObject({ type: 'RF_PASSPORT' });

    expect(cardView.full.title).toBe('Паспорт РФ');
    expect(cardView.empty.title).toBe('Добавьте паспорт');
  });
});
