import { TokenResponse } from '../types';
import { Logger } from './logger';
import { Url } from './url';

export class BrowserUrlManager {
  private readonly logger: Logger;
  private hashParams: URLSearchParams;
  private searchParams: URLSearchParams;

  constructor(logger: Logger) {
    this.logger = logger;

    const hashFragment = window?.location?.hash;
    const searchFragment = window?.location?.search;

    if (hashFragment) {
      this.hashParams = new URLSearchParams(hashFragment.charAt(0) === '#' ? hashFragment.substring(1) : hashFragment);
    } else {
      this.hashParams = new URLSearchParams();
    }

    if (searchFragment) {
      this.searchParams = new URLSearchParams(searchFragment);
    } else {
      this.searchParams = new URLSearchParams();
    }
  }

  get tokenReady(): boolean {
    return this.hashParams?.has('access_token') || this.searchParams?.has('code');
  }

  get currentUrl(): string {
    return Url.trimTrailingSlash(window?.location?.href?.split('?')?.[0] || '');
  }

  get rawState(): string | undefined {
    return this.searchParams.get('state') || this.hashParams.get('state');
  }

  checkUrlForState(): string | any {
    const state = this.getAndRemoveSearchParameter('state');

    if (state) {
      try {
        return JSON.parse(state);
      } catch {
        this.logger.debug('BrowserUrlManager', 'Failed to parse state into a JSON object, must be a plain old string', state);
        return state;
      }
    }

    return state;
  }

  checkUrlForCode(): string {
    this.logger.debug('BrowserUrlManager', 'checking code', { code: this.searchParams.get('code'), url: window.location });
    return this.getAndRemoveSearchParameter('code');
  }

  checkUrlForToken(): TokenResponse {
    if (this.hashParams.has('access_token')) {
      const token: TokenResponse = {
        access_token: this.hashParams.get('access_token'),
        expires_in: +this.hashParams.get('expires_in'),
        scope: this.hashParams.get('scope'),
        token_type: this.hashParams.get('token_type'),
        id_token: this.hashParams.get('id_token'),
      };

      this.logger.info('BrowserUrlManager', 'found an access token in the url', token);

      // Get rid of hash, so token isn't displayed in browser URL
      window.history.replaceState(null, null, `${window.location.pathname}${window.location.search ? `?${window.location.search}` : ''}`);

      this.hashParams = new URLSearchParams();

      return token;
    }

    return null;
  }

  navigate(url: string) {
    window.location.assign(url);
  }

  /**
   * Navigates to the provided url in a popup window and returns the popup's URL when it navigates back to the redirectURI
   *
   * @param url Url to navigate the popup window to
   * @param redirectUri Redirect URI that triggers the interval to clear
   * @param popup Reference to popup, this can optionally be provided by the user for better support
   * @returns Promise which resolves the complete url when the redirecURI is found, this url will contain the token or code and state
   */
  navigatePopup(url: string, redirectUri: string, popupRef?: Window): Promise<string> {
    let popup = popupRef;

    if (popup) {
      popup.location.href = url;
    } else {
      popup = window.open(url, 'oidc-popup', 'popup=true,width=600,height=800');
    }

    return new Promise((resolve) => {
      const checkPopup = setInterval(() => {
        try {
          if (!popup) {
            clearInterval(checkPopup);
            return;
          }

          if (popup.window.location.href.includes(redirectUri)) {
            resolve(popup.window.location.href);
            popup.close();
            clearInterval(checkPopup);
          }
        } catch (_) {
          this.logger.debug('BrowserUrlMananger', 'Error encountered in inverval watching the popup window, this is likely because the window is still navigated to auth server');
        }
      }, 150);
    });
  }

  private getAndRemoveSearchParameter(param: string): string {
    if (this.searchParams.has(param)) {
      const foundParam = this.searchParams.get(param);

      this.logger.info('BrowserUrlManager', `found ${param} in the url`, foundParam);

      this.searchParams.delete(param);

      const query = this.searchParams.toString();
      const queryStr = query ? `?${query}` : '';

      // Remove code from URL
      window.history.replaceState(null, null, window.location.pathname + queryStr + window.location.hash);

      return foundParam;
    }

    return '';
  }
}
