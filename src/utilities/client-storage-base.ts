import { TokenResponse } from '../types';
import OAuth from './oauth';

export abstract class ClientStorageBase {
  protected readonly TOKEN_KEY: string;
  protected readonly REFRESH_TOKEN_KEY: string;
  protected readonly CODE_VERIFIER_KEY: string;

  constructor(clientId: string) {
    this.TOKEN_KEY = `oidc-client:response:${clientId}`;
    this.REFRESH_TOKEN_KEY = `oidc-client:refresh_token:${clientId}`;
    this.CODE_VERIFIER_KEY = `oidc-client:code_verifier:${clientId}`;
  }

  abstract storeToken(token: TokenResponse): void;

  abstract getToken(): Promise<TokenResponse>;

  abstract getRefreshToken(): Promise<string | null>;

  abstract removeToken(): void;

  storeCodeVerifier(codeVerifier: string): void {
    sessionStorage.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  async getCodeVerifier(): Promise<string> {
    const encodedStr = sessionStorage.getItem(this.CODE_VERIFIER_KEY);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    sessionStorage.removeItem(this.CODE_VERIFIER_KEY);

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }
}
