import { encode as base64encode } from 'base64-arraybuffer';

const utils = {
  /**
   * Returns a code_challenge parameter to support the PKCE workflow.
   * @param {string} codeVerifier Used to validate already received code_challenge
   * @returns {string}
   */
  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder: TextEncoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(codeVerifier);
    const digest: ArrayBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const base64Digest: string = base64encode(digest);
    return base64Digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  },

  /** 
Returns a random string used for state and PKCE code_challenge.
@param {string} length Length of the generated string
@returns {string}
*/
  getRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
};

export default utils;
