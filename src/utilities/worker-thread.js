/**
 * Web Worker for in-memory storage that runs in a separate thread from the main app.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}
 */

// Object to store tokens and data in memory.
const oauthCache = []; // I.e. [{},{},{}]. The payload portions of the inbound message for store methods.
let responseMsg = {}; // A specific object from oathCache.

// sample inbound objects - delete this comment
// { method: 'getToken', payload: this.TOKEN_KEY };
// { method: 'storeToken', payload: { this.TOKEN_KEY, OAuth.btoa(token) } }

// eslint-disable-next-line no-undef
onmessage = async (inboundMsg) => {
  switch (inboundMsg.method) {
    case 'storeToken':
      if (oauthCache.length === 0) {
        oauthCache.push(inboundMsg.payload);
      } else {
        // TODO Array.map() or Array.splice() to add or update object.
      }
      break;
    case 'getToken':
      responseMsg = oauthCache.find((element) => element.payload === inboundMsg.payload);
      // TODO need to parse out the token before posting message.
      // eslint-disable-next-line no-undef
      postmessage(responseMsg);
      break;
    case 'getRefreshToken':
      responseMsg = oauthCache.find((element) => element.payload === inboundMsg.payload);
      // TODO need to parse out the token before posting message.
      // eslint-disable-next-line no-undef
      postmessage(responseMsg);
      break;
    case 'removeToken':
      if (inboundMsg?.payload) {
        // delete specific object by inboundMsg.payload
      } else {
        // Delete all the thingz
        oauthCache.length = 0;
      }
      break;
    case 'storeCodeVerifier':
      if (oauthCache.length === 0) {
        oauthCache.push(inboundMsg.payload);
      } else {
        // TODO Array.map( OR Array.splice() to add or update object.
      }
      break;
    case 'getCodeVerifier':
      responseMsg = oauthCache.find((element) => element.payload === inboundMsg.payload);
      // TODO need to parse out the token before posting message.
      // oauthCache.splice(4, 1, inboundMsg.payload);
      // Replaces 1 element at index 4
      // eslint-disable-next-line no-undef
      postmessage(responseMsg);
      break;
    default:
      throw new Error();
  }
};

// TODO Could this replace the switch/case statement?
// function updateOauthCache(inMsg) {
//   const newOauthCache = oauthCache.map((currentObj) => {
//     if (currentObj.key === inMsg.key) {
//       // look at inMsg.method and update / return object accordingly.
//       return 'update';
//     }
//     return currentObj;
//   });
//   oauthCache = newOauthCache;
// }

// sample inbound objects - delete this comment
// { method: 'removeToken', payload: this.TOKEN_KEY };
// { method: 'storeCodeVerifier', payload: { this.CODE_VERIFIER_KEY, OAuth.btoa(codeVerifier) } }
