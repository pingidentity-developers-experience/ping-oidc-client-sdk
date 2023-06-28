import { TokenResponse } from '../types';

export abstract class ClientStorage {
  readonly TOKEN_KEY = 'oidc-client:response';
  readonly REFRESH_TOKEN_KEY = 'oidc-client:refresh_token';
  readonly CODE_VERIFIER_KEY = 'oidc-client:code_verifier';

  abstract storeToken(token: TokenResponse): void;

  abstract getToken(): TokenResponse;

  abstract getRefreshToken(): string | null;

  abstract removeToken(): void;

  abstract storeCodeVerifier(codeVerifier: string): void;

  abstract getCodeVerifier(): string;
}
