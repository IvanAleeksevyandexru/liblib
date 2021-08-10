import { PipedMessagePipe } from './piped-message.pipe';

describe('PipedMessagePipe', () => {
  it('create an instance', () => {
    const pipe = new PipedMessagePipe();
    expect(pipe).toBeTruthy();
  });
});
