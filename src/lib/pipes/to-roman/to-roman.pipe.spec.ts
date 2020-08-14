import { ToRomanPipe } from './to-roman.pipe';

describe('ToRomanPipe', () => {
  let pipe: ToRomanPipe;

  beforeEach(() => {
    pipe = new ToRomanPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform 1 to I', () => {
    expect(pipe.transform(1)).toBe('I');
  });

  it('should transform 5 to V', () => {
    expect(pipe.transform(5)).toBe('V');
  });

  it('should transform 2020 to MMXX', () => {
    expect(pipe.transform(2020)).toBe('MMXX');
  });
});
