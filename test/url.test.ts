import { Url } from '../src/utilities';

describe('Url', () => {
  it('should pass through valid url', () => {
    const url = 'https://example.com';
    expect(Url.trimTrailingSlash(url)).toBe('https://example.com');
  });

  it('should remove trailing slash', () => {
    const url = 'https://example.com/';
    expect(Url.trimTrailingSlash(url)).toBe('https://example.com');
  });

  describe('URL Validation', () => {
    it('should accept valid url', () => {
      const url = 'https://auth.pingone.com/cc8801c7-a048-4a4f-bbc3-7a2604ca449a/as/.well-known/openid-configuration';
      expect(Url.isValidUrl(url)).toBe(true);
    });

    it('should not accept invalid url', () => {
      let url = 'google.com';
      expect(Url.isValidUrl(url)).toBe(false);

      url = 'totally wrong';
      expect(Url.isValidUrl(url)).toBe(false);
    });

    it('should not accept http urls by default', () => {
      const url = 'http://google.com';
      expect(Url.isValidUrl(url)).toBe(false);
    });

    it('should not accept http urls if acceptHttp is true', () => {
      const url = 'http://google.com';
      expect(Url.isValidUrl(url, true)).toBe(true);
    });
  });
});
