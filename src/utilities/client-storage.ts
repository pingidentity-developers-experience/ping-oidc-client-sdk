import { TokenResponse } from '../types';

export abstract class ClientStorage {
  abstract readonly TOKEN_KEY: string;
  abstract readonly REFRESH_TOKEN_KEY: string;
  abstract readonly CODE_VERIFIER_KEY: string;

  abstract storeToken(token: TokenResponse): void;

  abstract getToken(): TokenResponse;

  abstract getRefreshToken(): string | null;

  abstract removeToken(): void;

  abstract storeCodeVerifier(codeVerifier: string): void;

  abstract getCodeVerifier(): string;
}
