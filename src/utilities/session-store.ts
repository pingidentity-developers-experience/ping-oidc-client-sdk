/**
 * Class representing browser sessionStorage.
 * Subclass of the clientStorage abstract class.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
 */

import { StorageType, TokenResponse } from '../types';
import { ClientStorage } from './client-storage';
import OAuth from './oauth';

export class SessionClientStorage extends ClientStorage {
  private inMemoryToken: TokenResponse;
  readonly storage: StorageType;

  // eslint-disable-next-line no-useless-constructor
  constructor() {
    super();
  }

  override storeToken(token: TokenResponse): void {
    const refreshToken = token.refresh_token;
    if (refreshToken) {
      // eslint-disable-next-line no-param-reassign
      delete token.refresh_token;
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, OAuth.btoa(refreshToken));
    } else {
      // Remove old refresh token just in case, would be weird to hit this...
      sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    this.inMemoryToken = token;
    const str = JSON.stringify(token);
    sessionStorage.setItem(this.TOKEN_KEY, OAuth.btoa(str));
  }

  override getToken(): TokenResponse {
    if (this.inMemoryToken) {
      return this.inMemoryToken;
    }

    const encodedStr = sessionStorage.getItem(this.TOKEN_KEY);

    if (encodedStr) {
      const decodedStr = OAuth.atob(encodedStr);
      const token = JSON.parse(decodedStr);

      this.inMemoryToken = token;

      return token;
    }

    return null;
  }

  override getRefreshToken(): string {
    const refreshToken = sessionStorage.getItem(this.REFRESH_TOKEN_KEY);

    // Self destruct on retrieval, only needed once when refreshToken is called
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);

    return refreshToken ? OAuth.atob(refreshToken) : null;
  }

  override removeToken(): void {
    this.inMemoryToken = null;
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  override storeCodeVerifier(codeVerifier: string): void {
    sessionStorage.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  override getCodeVerifier(): string {
    const encodedStr = sessionStorage.getItem(this.CODE_VERIFIER_KEY);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    sessionStorage.removeItem(this.CODE_VERIFIER_KEY);

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }
}
