/**
 * Wrapper subclass representing a Web Worker for in-memory storage in a separate thread.
 * This has to be a wrapper class because a Web Worker cannot access the main thread and vice versa.
 * @see worker-thread.js
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers}
 */

import { TokenResponse } from '../types/token-response';
import { ClientStorage } from './client-storage';
import OAuth from './oauth';

// Local interface unique to this subclass
export interface WorkerMessage {
  // Name of method posting message to the Web Worker
  method: string;
  // Optional payload. The data sent to the Web Worker to be stored.
  payload?: string | object;
}

export class WorkerClientStorage extends ClientStorage {
  private readonly workerThread;
  private msg: WorkerMessage;

  constructor() {
    super();
    this.workerThread = new Worker('./worker-thread.js');
  }

  override storeToken(token: TokenResponse): void {
    const refreshToken = token.refresh_token;

    if (refreshToken) {
      // eslint-disable-next-line no-param-reassign
      delete token.refresh_token;
      this.msg = { method: 'storeToken', payload: { [this.REFRESH_TOKEN_KEY]: OAuth.btoa(refreshToken) } };
      this.workerThread.postMessage(this.msg);
    } else {
      // Remove old refresh token just in case, would be weird to hit this...
      this.msg = { method: 'removeToken', payload: this.REFRESH_TOKEN_KEY };
      this.removeToken();
    }

    const str = JSON.stringify(token);
    this.msg = { method: 'storeToken', payload: { [this.TOKEN_KEY]: OAuth.btoa(str) } };
    this.workerThread.postMessage(this.msg);
  }

  // TODO can we make this a promise that resolves when onmessage is called?
  override getToken(): TokenResponse {
    this.msg = { method: 'getToken', payload: this.TOKEN_KEY };
    const encodedStr = this.workerThread.postMessage(this.msg);

    if (encodedStr) {
      const decodedStr = OAuth.atob(encodedStr);
      const token = JSON.parse(decodedStr);

      return token;
    }

    return null;
  }

  override getRefreshToken(): string {
    this.msg = { method: 'getRefreshToken', payload: this.REFRESH_TOKEN_KEY };
    const refreshToken = this.workerThread.postMessage(this.msg);

    // Self destruct on retrieval, only needed once when refreshToken is called
    this.msg = { method: 'removeToken', payload: this.REFRESH_TOKEN_KEY };
    this.removeToken();
    return refreshToken ? OAuth.atob(refreshToken) : null;
  }

  override removeToken(): void {
    if (this.msg?.payload) {
      // Remove specific item
      this.workerThread.postMessage(this.msg);
    } else {
      // Remove all tokens and data
      this.msg = { method: 'removeToken' };
      this.workerThread.postMessage(this.msg);
    }
  }

  override storeCodeVerifier(codeVerifier: string): void {
    this.msg = { method: 'storeCodeVerifier', payload: { [this.CODE_VERIFIER_KEY]: OAuth.btoa(codeVerifier) } };
    this.workerThread.postMessage(this.msg);
  }

  override getCodeVerifier(): string {
    this.msg = { method: 'getCodeVerifier', payload: this.CODE_VERIFIER_KEY };
    const encodedStr = this.workerThread.postMessage(this.msg);

    // Self destruct on retrieval, only needed once to get the token from the authorization server
    this.msg = { method: 'removeToken', payload: this.CODE_VERIFIER_KEY };
    this.removeToken();

    return encodedStr ? OAuth.atob(encodedStr) : null;
  }
}
