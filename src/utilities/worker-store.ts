/**
 * Wrapper subclass representing a Web Worker for in-memory storage in a separate thread.
 * This has to be a wrapper class because a Web Worker cannot access the main thread.
 * @see worker-thread.ts
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers}
 */

import { StorageType } from '../types';
import { TokenResponse } from '../types/token-response';
import { ClientStorage } from './client-storage';

export class WorkerClientStorage extends ClientStorage {
  readonly TOKEN_KEY: string;
  readonly REFRESH_TOKEN_KEY: string;
  readonly CODE_VERIFIER_KEY: string;
  private workerThread;

  constructor() {
    super();
    this.workerThread = new Worker('./worker-thread.ts');
  }

  override storeToken(token: TokenResponse): void {
    const msg = { method: 'storeToken', payload: token };
    this.workerThread.postMessage(msg);
  }

  override getToken(): TokenResponse {
    const msg = { method: 'getToken' };
    this.workerThread.postMessage(msg);
    // TODO how do we handle this for all methods???
    this.workerThread.onmessage = (response) => {
      return { response };
    };
  }

  override getRefreshToken(): string {
    const msg = { method: 'getRefreshToken' };
    this.workerThread.postMessage(msg);
    // TODO need return value from onmessage event handler.
  }

  override removeToken(): void {
    const msg = { method: 'removeToken' };
    this.workerThread.postMessage(msg);
  }

  override storeCodeVerifier(codeVerifier: string): void {
    const msg = { method: 'storeCodeVerifier', payload: codeVerifier };
    this.workerThread.postMessage(msg);
  }

  override getCodeVerifier(): string {
    const msg = { method: 'getCodeVerifier' };
    this.workerThread.postMessage(msg);
    // TODO need return value from onmessage event handler.
  }
}
