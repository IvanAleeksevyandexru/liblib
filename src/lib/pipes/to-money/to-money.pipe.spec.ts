import { ToMoneyPipe } from './to-money.pipe';

describe('ToMoneyPipe', () => {
  it('create an instance', () => {
    const pipe = new ToMoneyPipe();
    expect(pipe).toBeTruthy();
  });
});
