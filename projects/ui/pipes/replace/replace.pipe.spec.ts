import { ReplacePipe } from './replace.pipe';

describe('ReplacePipe', () => {
  let pipe: ReplacePipe;

  beforeEach(() => {
    pipe = new ReplacePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('foo should be replaced with bar', () => {
    expect(pipe.transform('foo bar foobar', {
      pattern: new RegExp('foo', 'g'),
      replacement: 'bar'
    })).toBe('bar bar barbar');
  });
});
