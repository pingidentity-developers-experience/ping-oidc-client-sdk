import { OidcClient } from '@pingidentity-developers-experience/ping-oidc-client-sdk';

export async function initializeOidc(redirectEndpoint) {
  const clientOptions = {
    client_id: '6e610880-8e52-4ba7-a2dc-c5f9bd80f3ee',
    redirect_uri: `${window.location.origin}/${redirectEndpoint}`,
    scope: 'openid profile email revokescope', // defaults to 'openid profile email'
    // response_type: 'token', // defaults to 'code'
    // usePkce: false, // defaults to true
    // state: 'aad23b3c5f91a14fcef2fa48994478be857576ad', // will apply a random state as a string, you can pass in a string or object
    // logLevel: 'debug', // defaults to 'warn'
    // storageType: 'worker', // 'local' | 'session' | 'worker'. defaults to 'local'. Also falls back to 'local' for backwards compatibility when choosing 'worker' and the Worker object is not present.
    // customParams: { param1: 'value1', param2: 'value2' } // will append custom parameters to the authorization url.  Expects an object with string key/values.
  };

  /**
   * Dynamically fetches your OAuth authorization servers endpoints from the spec-defied .well-known endpoint.
   */
  return await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/b28c6458-9fc0-49cf-bf19-b7aaab1e7be7/as', clientOptions);
}
