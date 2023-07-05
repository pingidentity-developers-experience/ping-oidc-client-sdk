/**
 * Web Worker for in-memory storage that runs in a separate thread from the main app.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers}
 */

let cachedTokenResponse = null;
let cachedRefreshToken = null;

/**
 * Web Worker onmessage event handler.
 * case 'getCodeVerifier' and case 'storeCodeVerifier': are not implemented here.
 * Code verifier needs to persist across page loads/redirects, so these methods are implemented in the client storage base class.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event}
 */
// eslint-disable-next-line no-undef
onmessage = async (inboundMsg) => {
  switch (inboundMsg.data.method) {
    case 'storeToken':
      if (Object.keys(inboundMsg.data.payload)[0].toString().split(':')[1] === 'response') {
        cachedTokenResponse = inboundMsg.data.payload;
      } else if (Object.keys(inboundMsg.data.payload)[0].toString().split(':')[1] === 'refresh_token') {
        cachedRefreshToken = inboundMsg.data.payload;
      }
      break;
    case 'getToken':
      // eslint-disable-next-line no-undef
      postMessage(cachedTokenResponse);
      break;
    case 'getRefreshToken':
      // eslint-disable-next-line no-undef
      postMessage(cachedRefreshToken);
      break;
    case 'removeToken':
      if (inboundMsg.data?.payload) {
        if (Object.keys(inboundMsg.data.payload)[0].toString().split(':')[1] === 'response') {
          cachedTokenResponse = null;
        } else if (Object.keys(inboundMsg.data.payload)[0].toString().split(':')[1] === 'refresh_token') {
          cachedRefreshToken = null;
        }
      } else {
        cachedTokenResponse = null;
        cachedRefreshToken = null;
      }
      break;

    default:
      throw new Error('Storage method not found in inboundMsg or illegal shape of inboundMsg.');
  }
};
