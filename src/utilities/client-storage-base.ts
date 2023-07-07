import { TokenResponse } from '../types';
import OAuth from './oauth';

export abstract class ClientStorageBase {
  protected readonly TOKEN_KEY: string;
  protected readonly REFRESH_TOKEN_KEY: string;
  protected readonly CODE_VERIFIER_KEY: string;
  protected readonly STATE_KEY: string;

  constructor(clientId: string) {
    this.TOKEN_KEY = `oidc-client:response:${clientId}`;
    this.REFRESH_TOKEN_KEY = `oidc-client:refresh_token:${clientId}`;
    this.CODE_VERIFIER_KEY = `oidc-client:code_verifier:${clientId}`;
    this.STATE_KEY = `oidc-client:state:${clientId}`;

    this.migrateTokens?.(clientId);
  }

  // Need to migrate old stored tokens (without clientId) in the Key, this does not apply to WorkerClientStorage and thus is optional
  protected migrateTokens?(clientId: string): void;

  abstract storeToken(token: TokenResponse): void;

  abstract getToken(): Promise<TokenResponse>;

  abstract getRefreshToken(): Promise<string | null>;

  abstract removeToken(): void;

  storeCodeVerifier(codeVerifier: string): void {
    sessionStorage.setItem(this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier));
  }

  getCodeVerifier(): string {
    const encodedStr = sessionStorage.getItem(this.CODE_VERIFIER_KEY);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    sessionStorage.removeItem(this.CODE_VERIFIER_KEY);

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }

  setClientState(state: string): void {
    sessionStorage.setItem(this.STATE_KEY, state);
  }

  getClientState(): string {
    return sessionStorage.getItem(this.STATE_KEY);
  }

  removeClientState(): void {
    sessionStorage.removeItem(this.STATE_KEY);
  }
}
