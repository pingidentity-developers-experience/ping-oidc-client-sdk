/**
 * Class representing browser sessionStorage.
 * Subclass of the ClientStorageBase abstract class.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage}
 */

import { StorageType, TokenResponse } from '../types';
import { ClientStorageBase } from './client-storage-base';
import OAuth from './oauth';

export class SessionClientStorage extends ClientStorageBase {
  private inMemoryToken: TokenResponse;
  readonly storage: StorageType;

  protected override migrateTokens(clientId: string): void {
    const migrateKeys = [`oidc-client:response`, `oidc-client:refresh_token`, `oidc-client:code_verifier`];

    migrateKeys.forEach((key) => {
      const item = sessionStorage.getItem(key);
      if (item) {
        sessionStorage.setItem(`${key}:${clientId}`, item);
        sessionStorage.removeItem(key);
      }
    });
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

  override async getToken(): Promise<TokenResponse> {
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

  override async getRefreshToken(): Promise<string> {
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
}
