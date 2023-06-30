/**
 * Web Worker for in-memory storage that runs in a separate thread from the main app.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers}
 */

// Object to cache OAuth artifacts; tokens, refresh tokens, code verifier.
const oauthCache = []; // I.e. [{},{},{}]. The payload portions of the inbound message for store methods.
let responseMsg = {}; // A specific object from oauthCache requested by the Worker Store.
let objectIndex = 0;

/**
 * Extract cache data by object key.
 * All data, regardless of type is stored in cache the same, so the shape is predictable.
 * @param {*} key The static key from the client storage base class by which OAuth artifacts are stored.
 */
const extractCacheDataByKey = (key) => {
  console.log('Getting token with key: ', key);
  console.log('cache length: ', oauthCache.length);
  responseMsg = oauthCache.find((element) => {
    console.log('looking at element', element);
    const test = Object.keys(element)[0];
    console.log('looking at key: ', test);
    return Object.keys(element)[0] === key;
  });
  console.log('responseMsg1', responseMsg);
};

/**
 * Web Worker onmessage event handler.
 * case 'getCodeVerifier' and case 'storeCodeVerifier': are not implemented here.
 * Code verifier needs to persist across page loads/redirects, so these methods are implemented in the client storage base class.
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker/message_event}
 */
// eslint-disable-next-line no-undef
onmessage = async (inboundMsg) => {
  console.log('inboundMsg', inboundMsg);
  switch (inboundMsg.data.method) {
    case 'storeToken':
      console.log('Storing token in cache.');
      if (oauthCache.length === 0) {
        oauthCache.push(inboundMsg.data.payload);
      } else {
        // TODO just pushing the object while testing. Need to find existing object and update.
        oauthCache.push(inboundMsg.data.payload);
        // const keyToChange = Object.keys(inboundMsg.data.payload);
        // const index = oauthCache.map((element) => element[Object.keys(element)[0]]).indexOf(keyToChange);
        // oauthCache.splice(index, 1, inboundMsg.payload);
      }
      break;
    case 'getToken':
    case 'getRefreshToken':
      responseMsg = extractCacheDataByKey(inboundMsg.data.payload);
      // TODO ??? need to parse out the token before posting message.
      // eslint-disable-next-line no-undef
      postMessage(responseMsg);
      break;
    case 'removeToken':
      console.log('Removing token(s).');
      if (inboundMsg.data?.payload) {
        // delete specific object by inboundMsg.payload
        objectIndex = oauthCache.findIndex((element) => {
          return Object.keys(element)[0] === element.data.payload;
        });
        oauthCache.splice(objectIndex, 1);
      } else {
        // Delete all the thingz
        oauthCache.length = 0;
      }
      break;

    default:
      throw new Error('Storage method not found in inboundMsg or illegal shape of inboundMsg.');
  }
  const clone = structuredClone(oauthCache);
  console.log('oauthCache', JSON.stringify(clone));
};
