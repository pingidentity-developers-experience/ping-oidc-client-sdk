import { TokenResponse } from '../types';
import StorageType from '../types/client-storage';
import OAuth from './oauth';

declare let window: any;

export class ClientStorage {
  private readonly TOKEN_KEY = 'oidc-client:response';
  private readonly REFRESH_TOKEN_KEY = 'oidc-client:refresh_token';
  private readonly CODE_VERIFIER_KEY = 'oidc-client:code_verifier';

  private inMemoryToken: TokenResponse;

  private readonly storage: StorageType;
  private readonly store;

  constructor(storeType?: StorageType) {
    // Default storage type to Local
    this.storage = Object.values(StorageType).includes(storeType) ? storeType : StorageType.Local;
    // TODO dynamic storage object????
    this.store = window[this.storage];
    // Unless 'worker' was chosen
  }

  storeToken(token: TokenResponse) {
    const refreshToken = token.refresh_token;
    if (refreshToken) {
      // eslint-disable-next-line no-param-reassign
      delete token.refresh_token;
      this.store.setItem(this.REFRESH_TOKEN_KEY, OAuth.btoa(refreshToken));
    } else {
      // Remove old refresh token just in case, would be weird to hit this...
      this.store.removeItem(this.REFRESH_TOKEN_KEY);
    }

    this.inMemoryToken = token;
    const str = JSON.stringify(token);
    this.store.setItem(this.TOKEN_KEY, OAuth.btoa(str));
  }

  getToken(): TokenResponse {
    if (this.inMemoryToken) {
      return this.inMemoryToken;
    }

    const encodedStr = this.store.getItem(this.TOKEN_KEY);

    if (encodedStr) {
      const decodedStr = OAuth.atob(encodedStr);
      const token = JSON.parse(decodedStr);

      this.inMemoryToken = token;

      return token;
    }

    return null;
  }

  getRefreshToken(): string | null {
    const refreshToken = this.store.getItem(this.REFRESH_TOKEN_KEY);

    // Self destruct on retrieval, only needed once when refreshToken is called
    this.store.removeItem(this.REFRESH_TOKEN_KEY);

    return refreshToken ? OAuth.atob(refreshToken) : null;
  }

  removeToken() {
    this.inMemoryToken = null;
    this.store.removeItem(this.TOKEN_KEY);
    this.store.removeItem(this.REFRESH_TOKEN_KEY);
  }

  storeCodeVerifier(codeVerifier: string) {
    this.store.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  getCodeVerifier() {
    const encodedStr = this.store.getItem(this.CODE_VERIFIER_KEY);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    this.store.removeItem(this.CODE_VERIFIER_KEY);

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }
}
