import { ClientOptions } from '../types';
import { Logger } from './logger';

interface PkceArtifacts {
  codeVerifier: string;
  codeChallenge?: string;
}

// TODO DPOP
interface DpopHeader {
  typ: string;
  alg: string;
  jwk: string;
}

// TODO DPOP
interface DpopPayload {
  jti: string;
  htm: string;
  htu: string;
  iat: string;
  ath: string;
  nonce: string;
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

  static atob(decodeStr: string): string {
    let atob = window?.atob;

    if (!atob) {
      try {
        atob = (str) => Buffer.from(str, 'base64').toString('binary');
      } catch (error) {
        throw Error(`Could not find a suitable atob method, perhaps you're on an old browser or node version?`);
      }
    }

    return atob(decodeStr);
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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
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
    const codeVerifier = OAuth.getRandomString(128);

    let codeChallenge: string;

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
      codeVerifier,
      codeChallenge,
    };
  }

  static getOrGenerateState(options: ClientOptions, logger: Logger): string {
    let state: string;

    if (options.state) {
      state = typeof options.state === 'string' ? options.state : JSON.stringify(options.state);
    } else {
      state = OAuth.getRandomString(20);
    }

    logger.debug('Utilities.OAuth', 'State determined', state);
    return state;
  }

  // TODO DPOP
  // do we pull random algorithm from meta data dpop_signing_alg_values_supported???
  // Do we allow passing alg as an arg to force a specific alg? Think FinTech. The AS may support algs FinTech doesnt allow.
  /**
   * Generates DPoP proof JWTs
   * https://datatracker.ietf.org/doc/html/rfc9449#name-the-dpop-http-header
   */
  static generateDpopProof(htuClaim: string, alg?: string, nonce?: string): string {
    let dpopProofJwt: string;

    // create unique Id
    const jti = this.generateJtiClaim();
    // Get public key
    const publicKey = this.generatePublicKeyPair();
    // create timestamp
    const iat = new Date().getTime();

    // {
    //   "typ": "dpop+jwt",
    //     "alg": "RSA-OAEP",
    //       "jwk": {
    //     "kty": "EC",
    //       "x": "l8tFrhx-34tV3hRICRDY9zCkDlpBhF42UQUfWVAWBFs",
    //         "y": "9VE4jf_Ok_o64zbTTlcuNJajHmt6v9TDVrU0CdvGRDA",
    //           "crv": "P-256"
    //   }
    // }
    // .
    // {
    //   "jti": jti,
    //     "htm": "POST",
    //       "htu": htuClaim,
    //         "iat": iat
    // }
    return dpopProofJwt;
  }

  // TODO DPOP
  /**
   * Generates jti claim for DPoP proof JWT
   * https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
   */
  static generateJtiClaim(): string {
    const v4uuid = window.crypto.randomUUID();
    return v4uuid;
  }

  // TODO DPoP
  /**
   * Generates public-key pair for DPoP proof JWTs
   * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey
   */
  static async generatePublicKeyPair(alg?: string): Promise<Object> {
    const publicKeyPair = await window.crypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-384',
      },
      true,
      ['sign', 'verify'],
    ),
    return publicKeyPair;
  }

  /**
   * Export Crypto Key
   * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/exportKey#json_web_key_export
   */
  static async exportCryptoKey(cryptoKey) {
    const exportedKey = await window.crypto.subtle.exportKey('jwk', cryptoKey);
    return JSON.stringify(exportedKey, null, ' ');
  }
}
