import { TokenResponse } from '../types';
import OAuth from './oauth';

export class ClientStorage {
  private readonly TOKEN_KEY = 'oidc-client:response';
  private readonly CODE_VERIFIER_KEY = 'oidc-client:code_verifier';

  private inMemoryToken: TokenResponse;

  storeToken(token: TokenResponse) {
    this.inMemoryToken = token;
    const str = JSON.stringify(token);
    localStorage.setItem(this.TOKEN_KEY, OAuth.btoa(str));
  }

  getToken(): TokenResponse {
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

  removeToken() {
    this.inMemoryToken = null;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  storeCodeVerifier(codeVerifier: string) {
    localStorage.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  getCodeVerifier() {
    const encodedStr = localStorage.getItem(this.CODE_VERIFIER_KEY);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    localStorage.removeItem(this.CODE_VERIFIER_KEY);

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }

  clearAll() {
    localStorage.clear();
  }
}
