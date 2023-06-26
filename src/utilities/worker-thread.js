/**
 * Class representing a Web Worker for in-memory storage in a separate thread.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}
 */

// TODO do we need to wrap these in a closure?
let tokenCache = {};
let refreshTokenCache = {};
let codeVerifierCache = '';

// eslint-disable-next-line no-undef
onmessage = (msg) => {
  switch (msg.method) {
    case 'storeToken':
      tokenCache = msg.payload;
      refreshTokenCache = msg.payload; // TODO update for refresh token
      break;
    case 'getToken':
      // eslint-disable-next-line no-undef
      postmessage(tokenCache);
      break;
    case 'getRefreshToken':
      // eslint-disable-next-line no-undef
      postmessage(refreshTokenCache);
      break;
    case 'removeToken':
      tokenCache = {};
      refreshTokenCache = {};
      break;
    case 'storeCodeVerifier':
      codeVerifierCache = msg.payload; // TODO update for code verifier
      break;
    case 'getCodeVerifier':
      // eslint-disable-next-line no-undef
      postmessage(codeVerifierCache);
      break;
    default:
      throw new Error();
  }
};
