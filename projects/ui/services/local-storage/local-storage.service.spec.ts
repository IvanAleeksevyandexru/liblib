import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { configureTestSuite } from 'ng-bullet';

const TEST_KEY = 'TEST_KEY';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  const mockObject = {
    someKey: 'someValue'
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      providers: [LocalStorageService],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    localStorage.removeItem(TEST_KEY);
  });

  describe('getObject()', () => {
    it('should return object by key', () => {
      const item = JSON.stringify(mockObject);
      localStorage.setItem(TEST_KEY, item);
      const result = service.get(TEST_KEY);
      expect(result).toEqual(mockObject);
    });

    it('should throw error when get not object', () => {
      const item = 'I\'m going to blow';
      localStorage.setItem(TEST_KEY, item);
      expect(() => service.get(TEST_KEY)).toThrow('Unexpected token I in JSON at position');
    });
  });

  describe('getRaw()', () => {
    it('should return rawValue by key', () => {
      const item = 'someValue';
      localStorage.setItem(TEST_KEY, item);
      const result = service.getRaw(TEST_KEY);
      expect(result).toEqual(item);
    });
  });

  describe('set()', () => {
    it('should set object by key', () => {
      const rawItem = JSON.stringify(mockObject);
      service.set(TEST_KEY, mockObject);
      expect(localStorage.getItem(TEST_KEY)).toEqual(rawItem);
    });
  });

  describe('setRaw()', () => {
    it('should set raw string by key', () => {
      const rawItem = 'someValue';
      service.setRaw(TEST_KEY, rawItem);
      expect(localStorage.getItem(TEST_KEY)).toEqual(rawItem);
    });
  });

  describe('delete()', () => {
    it('should delete item by key', () => {
      const rawItem = 'someValue';
      service.setRaw(TEST_KEY, rawItem);
      service.delete(TEST_KEY);
      const result = service.getRaw(TEST_KEY);
      expect(result).toBeNull();
    });
  });
});
