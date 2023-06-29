/**
 * Web Worker for in-memory storage that runs in a separate thread from the main app.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}
 */

// Object to store tokens and data in memory.
const oauthCache = []; // I.e. [{},{},{}]. The payload portions of the inbound message for store methods.
let responseMsg = {}; // A specific object from oathCache.

// eslint-disable-next-line no-undef
onmessage = (inboundMsg) => {
  switch (inboundMsg.data.method) {
    case 'storeToken':
      if (oauthCache.length === 0) {
        oauthCache.push(inboundMsg.data.payload);
      } else {
        const keyToChange = Object.keys(inboundMsg.data.payload);
        const index = oauthCache.map((element) => element[Object.keys(element)[0]]).indexOf(keyToChange);
        oauthCache.splice(index, 1, inboundMsg.payload);
      }
      break;
    case 'getToken':
      responseMsg = oauthCache.find((element) => element.payload === inboundMsg.data.payload);
      // TODO ??? need to parse out the token before posting message.
      // eslint-disable-next-line no-undef
      postMessage(responseMsg);
      break;
    case 'getRefreshToken':
      responseMsg = oauthCache.find((element) => element.payload === inboundMsg.data.payload);
      // TODO ??? need to parse out the token before posting message.
      // eslint-disable-next-line no-undef
      postMessage(responseMsg);
      break;
    case 'removeToken':
      if (inboundMsg.data?.payload) {
        // delete specific object by inboundMsg.payload
      } else {
        // Delete all the thingz
        oauthCache.length = 0;
      }
      break;
    case 'storeCodeVerifier':
      if (oauthCache.length === 0) {
        oauthCache.push(inboundMsg.data.payload);
      } else {
        // TODO Array.map( OR Array.splice() to add or update object.
      }
      break;
    case 'getCodeVerifier':
      responseMsg = oauthCache.find((element) => element.payload === inboundMsg.data.payload);
      // TODO need to parse out the token before posting message.
      // oauthCache.splice(4, 1, inboundMsg.payload);
      // Replaces 1 element at index 4
      // eslint-disable-next-line no-undef
      postMessage(responseMsg);
      break;
    default:
      throw new Error();
  }
};
