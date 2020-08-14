import { PluralizePipe } from './pluralize.pipe';

const captions: [string, string, string] = ['год', 'года', 'лет'];

describe('PluralizePipe', () => {
  let pipe: PluralizePipe;

  beforeEach(() => {
    pipe = new PluralizePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return caption for 1', () => {
    expect('1 ' + pipe.transform(captions, 1)).toBe('1 год');
  });

  it('should return caption for 2', () => {
    expect('2 ' + pipe.transform(captions, 2)).toBe('2 года');
  });

  it('should return caption for 10', () => {
    expect('10 ' + pipe.transform(captions, 10)).toBe('10 лет');
  });
});
