import { LimitNumberPipe } from './limit-number.pipe';

describe('LimitNumberPipe', () => {
  let pipe: LimitNumberPipe;

  beforeEach(() => {
    pipe = new LimitNumberPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return exact number when less or equal max', () => {
    expect(pipe.transform(9, 9)).toEqual('9');
  });

  it('should return number when string passed', () => {
    expect(pipe.transform('7', 9)).toEqual('7');
  });

  it('should return max when value bigger', () => {
    expect(pipe.transform('10', 9)).toEqual('9+');
  });
});
