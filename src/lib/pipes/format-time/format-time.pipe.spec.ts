import { FormatTimePipe } from './format-time.pipe';

describe('FormatTimePipe', () => {
  let pipe: FormatTimePipe;

  beforeEach(() => {
    pipe = new FormatTimePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format 260 seconds to 04:20', () => {
    expect(pipe.transform(260)).toBe('04:20');
  });
});
