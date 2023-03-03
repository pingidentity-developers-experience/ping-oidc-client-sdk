import { ClientOptions } from '../types';
import Logger from './logger';

interface PkceArtifacts {
  codeVerifier: string;
  state: string;
  nonce: string;
  codeChallenge?: string;
}

export class OAuth {
  /**
   *
   * @param str
   * @returns
   */
  static btoa(encodeStr: string): string {
    let btoa = window?.btoa;

    if (!btoa) {
      try {
        btoa = (str) => Buffer.from(str, 'binary').toString('base64');
      } catch (error) {
        throw Error(`Could not find a suitable btoa method, perhaps you're on an old browser or node version?`);
      }
    }

    return btoa(encodeStr);
  }

  static atob(encodeStr: string): string {
    let atob = window?.atob;

    if (!atob) {
      try {
        atob = (str) => Buffer.from(str, 'base64').toString('binary');
      } catch (error) {
        throw Error(`Could not find a suitable atob method, perhaps you're on an old browser or node version?`);
      }
    }

    return atob(encodeStr);
  }

  /**
   * Generates the code_challenge parameter to support the PKCE workflow.
   *
   * @param {string} codeVerifier Used to validate already received code_challenge
   * @returns {string} code challenge that has been generated
   */
  static async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);

    const digest = await window.crypto.subtle.digest('SHA-256', data);
    // btoa is the way to do this in browser, we'd need to use Buffer.from to support Node
    const base64Digest = OAuth.btoa(String.fromCharCode(...new Uint8Array(digest)));

    // .replaces are for URL Encoding
    return base64Digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /** 
    Generates a random string used for state and PKCE code_challenge.

    @param {number} length Length of the generated string
    @return {string} random string that has been generated
    */
  static getRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Generates the artifacts necessary to add code challenge parameters to request
   *
   * @param {ClientOptions} options Options passed into the authorize method
   * @param {Logger} logger instance of the logger set up calling class
   * @returns {Promise<PkceArtifacts>} artifacts necessary to be sent through the request body or URL
   */
  static async generatePkceArtifacts(options: ClientOptions, logger: Logger): Promise<PkceArtifacts> {
    let state: string;
    const codeVerifier = OAuth.getRandomString(128);

    if (options.state) {
      state = typeof options.state === 'string' ? options.state : JSON.stringify(options.state);
    } else {
      state = OAuth.getRandomString(20);
    }

    let codeChallenge: string;

    logger.debug('Utilities.OAuth', 'PKCE Request state generated', state);
    logger.debug('Utilities.OAuth', 'PKCE CodeVerifier generated', codeVerifier);

    if (options.usePkce) {
      try {
        codeChallenge = await OAuth.generateCodeChallenge(codeVerifier);
        logger.debug('Utilities.OAuth', 'Code Challenge successfully generated', codeChallenge);
      } catch (e) {
        logger.error('Utilities.OAuth', 'Error generating code challenge', e);
        throw Error('Unexpected exception in authorize() while generating code challenge');
      }
    }

    return {
      nonce: OAuth.getRandomString(10),
      codeVerifier,
      codeChallenge,
      state,
    };
  }
}

export default OAuth;
