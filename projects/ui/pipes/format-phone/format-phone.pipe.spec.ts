import { FormatPhonePipe } from './format-phone.pipe';

describe('FormatPhonePipe', () => {
  let pipe: FormatPhonePipe;

  beforeEach(() => {
    pipe = new FormatPhonePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format +7(907)1111111 to +7 (907) 111-11-11', () => {
    expect(pipe.transform('+7(907)1111111')).toBe('+7 (907) 111-11-11');
  });
});
