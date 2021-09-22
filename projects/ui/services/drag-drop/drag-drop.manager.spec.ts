import { TestBed } from '@angular/core/testing';

import { DragDropManager } from './drag-drop.manager';

describe('DragDropManager', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DragDropManager = TestBed.inject(DragDropManager);
    expect(service).toBeTruthy();
  });
});
