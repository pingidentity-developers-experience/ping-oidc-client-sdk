/**
 * Class representing browser localStorage.
 * Subclass of the ClientStorageBase abstract class.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
 */

import { StorageType, TokenResponse } from '../types';
import { ClientStorageBase } from './client-storage-base';
import OAuth from './oauth';

export class LocalClientStorage extends ClientStorageBase {
  private inMemoryToken: TokenResponse;
  readonly storage: StorageType;

  override storeToken(token: TokenResponse): void {
    const refreshToken = token.refresh_token;
    if (refreshToken) {
      // eslint-disable-next-line no-param-reassign
      delete token.refresh_token;
      localStorage.setItem(this.REFRESH_TOKEN_KEY, OAuth.btoa(refreshToken));
    } else {
      // Remove old refresh token just in case, would be weird to hit this...
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    this.inMemoryToken = token;
    const str = JSON.stringify(token);
    localStorage.setItem(this.TOKEN_KEY, OAuth.btoa(str));
  }

  override async getToken(): Promise<TokenResponse> {
    if (this.inMemoryToken) {
      return this.inMemoryToken;
    }

    const encodedStr = localStorage.getItem(this.TOKEN_KEY);

    if (encodedStr) {
      const decodedStr = OAuth.atob(encodedStr);
      const token = JSON.parse(decodedStr);

      this.inMemoryToken = token;

      return token;
    }

    return null;
  }

  override async getRefreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    // Self destruct on retrieval, only needed once when refreshToken is called
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);

    return refreshToken ? OAuth.atob(refreshToken) : null;
  }

  override removeToken(): void {
    this.inMemoryToken = null;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  override storeCodeVerifier(codeVerifier: string): void {
    localStorage.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  override getCodeVerifier(): string {
    const encodedStr = localStorage.getItem(this.CODE_VERIFIER_KEY);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    localStorage.removeItem(this.CODE_VERIFIER_KEY);

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }

  override setClientState(state: string): void {
    localStorage.setItem(this.STATE_KEY, state);
  }

  override getClientState(): string {
    return localStorage.getItem(this.STATE_KEY);
  }

  override removeClientState(): void {
    localStorage.removeItem(this.STATE_KEY);
  }
}
