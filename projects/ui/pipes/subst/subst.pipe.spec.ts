import { SubstPipe } from './subst.pipe';

describe('SubstPipe', () => {
  let pipe: SubstPipe;

  beforeEach(() => {
    pipe = new SubstPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format pattern with substs', () => {
    expect(pipe.transform('%0, you owe me %1 dollars and %2 cents', 'Alex', '10', '25')).toBe('Alex, you owe me 10 dollars and 25 cents');
  });
});
