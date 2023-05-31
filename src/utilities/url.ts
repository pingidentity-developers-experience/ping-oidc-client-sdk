export class Url {
  /**
   * Verifies a url ends in a slash and adds one if not
   *
   * @param {string} url url to check
   * @returns {string} url with trailing slash
   */
  static trimTrailingSlash(url: string): string {
    return url.endsWith('/') ? url.substring(0, url.length - 1) : url;
  }

  static isValidUrl(urlString: string): boolean {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const url = new URL(urlString);
      return url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
