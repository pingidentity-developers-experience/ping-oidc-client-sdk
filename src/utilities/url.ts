export class Url {
  /**
   * Verfies a url ends in a slash and adds one if not
   *
   * @param {string} url url to check
   * @returns {string} url with trailing slash
   */
  static ensureTrailingSlash(url: string): string {
    return url.endsWith('/') ? url : `${url}/`;
  }
}

export default Url;
