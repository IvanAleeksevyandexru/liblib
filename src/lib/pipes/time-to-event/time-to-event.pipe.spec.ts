import { TimeToEventPipe } from './time-to-event.pipe';

describe('TimeToEventPipe', () => {
  it('create an instance', () => {
    const pipe = new TimeToEventPipe();
    expect(pipe).toBeTruthy();
  });
});
