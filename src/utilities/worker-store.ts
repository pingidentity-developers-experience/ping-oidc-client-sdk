/**
 * Wrapper subclass representing a Web Worker for in-memory storage in a separate thread.
 * This has to be a wrapper class because a Web Worker cannot access the main thread and vice versa.
 * @see worker-thread.js
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers}
 */

import { TokenResponse } from '../types/token-response';
import { ClientStorageBase } from './client-storage-base';
import OAuth from './oauth';

// We need to import this file as plain text so we can stick it in a blob and use it as an objectURL
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax, import/extensions, import/no-unresolved
import workerCode from '!!raw-loader!../../uglify-raw!babel-loader!./worker-thread.js';

// Local interface unique to this subclass
export interface WorkerMessage {
  // Name of method posting message to the Web Worker
  method: string;
  // Optional payload. The data sent to the Web Worker to be stored.
  payload?: string | object;
}

export class WorkerClientStorage extends ClientStorageBase {
  private readonly workerThread;
  private msg: WorkerMessage;

  constructor() {
    super();
    const workerBlob = new Blob([workerCode], { type: 'text/javascript' });
    this.workerThread = new Worker(window.URL.createObjectURL(workerBlob));
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
      this.msg = { method: 'removeToken', payload: [this.REFRESH_TOKEN_KEY] };
      this.removeToken();
    }

    const str = JSON.stringify(token);
    this.msg = { method: 'storeToken', payload: { [this.TOKEN_KEY]: OAuth.btoa(str) } };
    this.workerThread.postMessage(this.msg);
  }

  override async getToken(): Promise<TokenResponse> {
    return new Promise((resolve, reject) => {
      this.msg = { method: 'getToken', payload: `${this.TOKEN_KEY}` };
      this.workerThread.postMessage(this.msg);
      this.workerThread.onmessage = (response) => {
        const encodedStr = response.data?.[this.TOKEN_KEY];
        if (encodedStr) {
          const decodedStr = OAuth.atob(encodedStr);
          const token = JSON.parse(decodedStr);
          resolve(token);
        } else {
          resolve(null);
        }
      };
    });
  }

  override getRefreshToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.msg = { method: 'getRefreshToken', payload: `${this.REFRESH_TOKEN_KEY}` };
      this.workerThread.postMessage(this.msg);
      this.workerThread.onmessage = (response) => {
        const refreshToken = response.data?.[this.REFRESH_TOKEN_KEY];
        if (refreshToken) {
          this.msg = { method: 'removeToken', payload: `${this.REFRESH_TOKEN_KEY}` };
          this.removeToken();
          resolve(OAuth.atob(refreshToken));
        } else {
          reject(new Error('Token not found.'));
        }
      };
    });
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
}
