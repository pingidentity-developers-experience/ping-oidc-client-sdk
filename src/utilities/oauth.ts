import { AuthZOptions } from '../types';
import Logger from './logger';

interface PkceArtifacts {
  CodeVerifier: string;
  CodeChallenge: string;
  CodeChallengeMethod: string;
  State: string;
}

export class OAuth {
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
    const base64Digest = window.btoa(String.fromCharCode(...new Uint8Array(digest)));

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
   * @param {AuthZOptions} options Options passed into the authorize method
   * @param {Logger} logger instance of the logger set up calling class
   * @returns {Promise<PkceArtifacts>} artifacts necessary to be sent through the request body or URL
   */
  static async generatePkceArtifacts(options: AuthZOptions, logger: Logger): Promise<PkceArtifacts> {
    const state = OAuth.getRandomString(20);
    const codeVerifier = OAuth.getRandomString(128);

    let codeChallenge: string;
    let codeChallengeMethod: string;

    logger.debug('Utilities.OAuth', 'PKCE Request state generated', state);
    logger.debug('Utilities.OAuth', 'PKCE CodeVerifier generated', codeVerifier);

    try {
      codeChallenge = await OAuth.generateCodeChallenge(codeVerifier);
      logger.debug('Utilities.OAuth', 'Code Challenge successfully generated', codeChallenge);
    } catch (e) {
      logger.error('Utilities.OAuth', 'Error generating code challenge', e);
      throw Error('Unexpected exception in authorize() while generating code challenge');
    }

    const validCodeChallenges = ['S256'];
    if (validCodeChallenges.includes(options.CodeChallengeMethod)) {
      codeChallengeMethod = options.CodeChallengeMethod;
      logger.info('Utilities.OAuth', 'CodeChallengeMethod verified', options.CodeChallengeMethod);
    } else if (options.CodeChallengeMethod) {
      logger.warn('Utilities.OAuth', `Invalid CodeChallengeMethod encountered, valid options are [${validCodeChallenges.join(', ')}]`);
    }

    return {
      CodeVerifier: codeVerifier,
      CodeChallenge: codeChallenge,
      CodeChallengeMethod: codeChallengeMethod,
      State: state,
    };
  }
}

export default OAuth;
