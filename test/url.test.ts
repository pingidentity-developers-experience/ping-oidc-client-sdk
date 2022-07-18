import { Url } from '../src/utilities';

describe('Url', () => {
  it('should add trailing slash if not already there', () => {
    const url = 'https://example.com';
    expect(Url.ensureTrailingSlash(url)).toBe('https://example.com/');
  });

  it('should not add trailing slash if already there', () => {
    const url = 'https://example.com/';
    expect(Url.ensureTrailingSlash(url)).toBe('https://example.com/');
  });
});
