import { TokenResponse } from '../types';
import OAuth from './oauth';

export class ClientStorage {
  private readonly TOKEN_KEY = 'oidc-client:response';
  private readonly CODE_VERIFIER_KEY = 'oidc-client:code_verifier';

  storeToken(token: TokenResponse) {
    const str = JSON.stringify(token);
    localStorage.setItem(this.TOKEN_KEY, OAuth.btoa(str));
  }

  getToken(): TokenResponse {
    const encodedStr = localStorage.getItem(this.TOKEN_KEY);

    if (encodedStr) {
      const decodedStr = OAuth.atob(encodedStr);
      return JSON.parse(decodedStr);
    }

    return null;
  }

  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  storeCodeVerifier(codeVerifier: string) {
    localStorage.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  getCodeVerifier() {
    const encodedStr = localStorage.getItem(this.CODE_VERIFIER_KEY);
    return encodedStr ? OAuth.atob(encodedStr) : null;
  }

  removeCodeVerifier() {
    localStorage.removeItem(this.CODE_VERIFIER_KEY);
  }

  clearAll() {
    localStorage.clear();
  }
}

export default ClientStorage;
