import Logger from './logger';

export class BrowserUrlManager {
  private readonly logger: Logger;
  private readonly hashParams: URLSearchParams;
  private readonly searchParams: URLSearchParams;

  constructor(logger: Logger) {
    this.logger = logger;

    const hashFragment = window?.location?.hash;
    const searchFragment = window?.location?.search;

    if (hashFragment) {
      this.hashParams = new URLSearchParams(hashFragment.charAt(0) === '#' ? hashFragment.substring(1) : hashFragment);
    }

    if (searchFragment) {
      this.searchParams = new URLSearchParams(searchFragment);
    }
  }

  get tokenReady(): boolean {
    return this.hashParams?.has('access_token') || this.searchParams?.has('code');
  }
}

export default BrowserUrlManager;
