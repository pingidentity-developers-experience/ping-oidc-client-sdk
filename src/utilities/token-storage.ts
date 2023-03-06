import { TokenResponse } from '../types';
import OAuth from './oauth';

export class TokenStorage {
  private readonly TOKEN_KEY = 'oidc-client:response';

  storeToken(token: TokenResponse) {
    const str = JSON.stringify(token);
    localStorage.setItem(this.TOKEN_KEY, OAuth.btoa(str));
  }

  getToken(): TokenResponse {
    const encodedStr = localStorage.getItem(this.TOKEN_KEY);
    const decodedStr = OAuth.atob(encodedStr);
    return JSON.parse(decodedStr);
  }
}

export default TokenStorage;
