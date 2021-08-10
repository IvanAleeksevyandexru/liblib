import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ListItemsService } from './list-items.service';

describe('ListItemsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [ HttpClientTestingModule ],
    providers: [ListItemsService]
  }));

  it('should be created', () => {
    const service: ListItemsService = TestBed.inject(ListItemsService);
    expect(service).toBeTruthy();
  });
});
