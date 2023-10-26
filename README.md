# OAuth/OIDC Client-side SDK
## From Ping Identity
### Authors: Technical Enablement Demo Team

---
## NOTE:
### For native integration with your Javascript or browser-based apps, please use the NPM package hosted [here](https://www.npmjs.com/package/@pingidentity-developers-experience/ping-oidc-client-sdk?activeTab=readme).
### You only need to clone or fork this repo if your intent is to contribute to, or extend, this SDK project.
---

### Shortcuts

- [tl;dr - I'm a pro, I just wanna play!](#tldr)
- [Project details](#project-details)
- [Security](#security)
- [What's Included](#whats-included)
- [Step by Step - Package/Module](#step-by-step-npm)
- [Step by Step - Plain-old Javascript](#step-by-step-pojs)
- [ClientOptions Parameter Details](#options-details)
- [Misc. Details](#misc-details)
- [Requesting enhancements or reporting issues](#requests-issues)
- [Known Gotchas](#gotchas)
- [Disclaimer](#disclaimer)

### tl;dr - I Just Wanna Play<a id="tldr"></a>
``` JavaScript
// Install the SDK package in your project with either npm or yarn.
// Import or require an instance of the SDK. This example calls it `OidcClient`.

// Set your OAuth configs
const clientOptions = {
  client_id: '<authn-server-client-id>',
  // redirect_uri: 'https://example.com/page', 
  // response_type: 'token', 
  // usePkce: false,
  // scope: 'openid profile revokescope',
  // state: 'xyz', 
  // logLevel: 'debug',
  // storageType: 'worker',  // defaults to 'local'. Also falls back to 'local' for backwards compatibility when choosing 'worker' and the Worker object is not present.
  // customParams: { param1: 'value1', param2: 'value2' } // will append custom parameters to the authorization url.  Expects an object with string key/values.
};

// Initialize the SDK using an authorization server's well-known endpoint. Note this takes in the base url of the auth server, not the well-known endpoint itself. '/.well-known/openid-configuration' will be appended to the url by the SDK.
const oidcClient = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/<env-id>/as', clientOptions);

// Authorize a user. Note this will use window.location.assign, thus redirecting the user after the url is generated.
oidcClient.authorize(/* optional login_hint */);

// Get the token from storage
if (await oidcClient.hasToken()) {
  const token = await oidcClient.getToken();
}
// That's it.
```

### Project Details<a id="project-details"></a>
This project is an OAuth/OIDC SDK hosted at [npmjs.com](https://www.npmjs.com/package/@pingidentity-developers-experience/ping-oidc-client-sdk?activeTab=readme), for bootstrapping the [OAuth](https://www.rfc-editor.org/rfc/rfc6749) and [OpenID Connect (OIDC)](https://openid.net/developers/specs/) protocol in your own custom applications, with the intent to automate or simplify steps in the protocol flow and integration of it. This allows you, the developer, to do what you do best, focusing on your company's business apps, while Ping Identity handles what we do best, identity security.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen as much as possible over 3rd-party packages and libraries which incur supply chain risks, and may conflict with your company's security standards. Additionally, native Javascript APIs simplify maintenance for Ping Identity and its customers, and reduces the potential attack vectors of this package in your applications.

This project was built to the OAuth/OIDC specs, and is not Ping proprietary. Therefore this SDK will work with any OAuth-compliant authorization server.

### Security<a id="security"></a>

#### Best practices

For guidelines on security best practices please see [OAUTH 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07) and [OAUTH 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-16).

#### Software Bill of Materials

NPM transient dependencies can run deep. For this reason, we include a software bill of materials (SBOM) with each release that you or your security teams can audit. These SBOMs are generated using [CycloneDX by OWASP](https://owasp.org/www-project-cyclonedx/). Packages we import are primarily for development of the SDK and can be excluded in builds. These packages may change at our discretion.

#### Responsible Disclosure

**Please read the [Contributor Guidelines](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/blob/main/.github/CONTRIBUTING.md) for reporting security issues.**

Before each release, we run the following commands against our project to ensure a clean project. We make every reasonable effort to resolve category critical and high vulnerabilities.

`npm doctor`
`npx unimported`
`npm outdated`
`npx depcheck`
`npm audit`

Because of the as-is offering and license of this project, it is highly recommended that users of this SDK run `npm audit`, or the Javascript SAST tool of your choice, and evaluate the results and  make changes to meet your internal application security requirements.

### What's Included:

- Authorization code grant
- Implicit grant
- PKCE
- State
- Get / Revoke / Refresh Token
- End session / Logout
- User Info
- Storage Options; *local, session, Worker (in-memory)*
- Custom params support on the /authorize call.

### Step-by-step - Package/Module<a id="step-by-step-npm"></a>

If you want to see an example app and integration running before digging your feet in below, check out our [OIDC SDK example integration package](https://github.com/pingidentity-developers-experience/ping-integration-example-packages) in our growing library of integration examples.

**1) Install the SDK in your project from NPM**

```Bash
# With npm
npm install @pingidentity-developers-experience/ping-oidc-client-sdk

# With yarn
yarn add @pingidentity-developers-experience/ping-oidc-client-sdk
```

**2) In your app code**

`import { OidcClient } from '@pingidentity-developers-experience/ping-oidc-client-sdk';`

#### Usage:
Note these examples show usage against PingOne, but the OidcClient will work against any OAuth/OIDC compliant authorization server. Also, this SDK is written using TypeScript so you will get typings in your app if needed.

**Errors from the SDK** are passed up to your application so that you can handle them gracefully and manage your UX requirements. You can catch them in a try/catch block if you are using async/await or you can use the catch() method on the promise returned from the function call.

**3) We recommend you initialize the SDK using the static initializeFromOpenIdConfig method shown above, as this will hit the authorization server's well-known endpoint and use the meta data in the response to configure the SDK endpoints for you.**

``` JavaScript
// Initialize the SDK using an authorization server's well-known endpoint. Note this takes in the base url of the auth server, not the well-known endpoint itself. '/.well-known/openid-configuration' will be appended to the url by the SDK.
const oidcClient = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/<env-id>/as', clientOptions);
```

Alternatively, if you have limitations with using your .well-known endpoint, you can initialize an OidcClient manually.

``` JavaScript
const clientOptions = {
  client_id: '<authn-server-client-id>',
};

const openIdConfig = {
  authorization_endpoint: "https://auth.pingone.com/<env-id>/as/authorize", // Required
  token_endpoint: "https://auth.pingone.com/<env-id>/as/token", // Required
  revocation_endpoint: "https://auth.pingone.com/<env-id>/as/revoke", // Required if using revokeToken() function
  userinfo_endpoint: "https://auth.pingone.com/<env-id>/as/userinfo", // Required if using fetchUserInfo() function
  end_session_endpoint: "https://auth.pingone.com/<env-id>/as/signoff" // Required if using endSession() function
};

const client = await OidcClient.initializeClient(clientOptions, openIdConfig);
```

**4) Getting a token from storage** - plus revoke, refresh, and ending a session
``` JavaScript
if (await oidcClient.hasToken()) {
  const token = await oidcClient.getToken();

  // If you need the state that was passed to the server, you can get it from the TokenResponse managed by the SDK
  const state = token.state;

  // Revoke the token on the server and remove it from storage
  await oidcClient.revokeToken();

  // Refresh the access token and store the new token in storage
  await oidcClient.refreshToken();

  // End the user's session using the end_session_endpoint on the auth server
  await oidcClient.endSession(/* optional post logout redirect uri */);
}
```

**5) Other optional calls**

If you wish to override the authorize() behavior and apply it to an anchor tag, for example, you can capture the URL like this.
```JavaScript
const authnUrl = await oidcClient.authorizeUrl(/* optional login_hint */);
```

This is used to get the user info from the userinfo endpoint on the authZ server. This must be used after the user has gone through authorize flow and an ID token is available in storage.
```JavaScript
const userInfo = await oidcClient.fetchUserInfo();
```

### Usage without node/npm<a id="step-by-step-pojs"></a>

If you wish to use the SDK in a web application that does not use node or npm you can import it from unpkg or a similar CDN and use it as follows.

``` HTML
<!-- NOTE: In most cases you should specify a version in case we release major/breaking changes, see https://www.unpkg.com/ for more information -->
<script type="module" src="https://unpkg.com/@pingidentity-developers-experience/ping-oidc-client-sdk/lib/ping-oidc.js"></script>

<script type="text/javascript">
  const client = await pingOidc.OidcClient.initializeFromOpenIdConfig({...});
  // The above step-by-step examples will be the same after this.
</script>
```

### ClientOptions Parameter<a id="options-details"></a>

| Parameter   | Type (TS enum where applicable) | Description  | Options | Default value if not specified |
| ----------- | ---- |------------- | ------- | ------------- |
| client_id (required)| string | Client id issued by the auth server for your application | - | - |
| redirect_uri | string | Redirect URI for server to send user back to | - | Current URL from browser when SDK was initialized |
| response_type | string | Token response type |`'code'`, `'token'`|`'code'`|
| usePkce | boolean | Whether the SDK will add a code challenge to the url | `true`, `false` | `true` |
| scope | string | Requested scopes for token | - | `'openid profile'` |
| state | string \| object | State passed to server | - | Random string to act as a nonce token |
| logLevel | string (LogLevel) | Logging level for statements printed to console | `'debug'`, `'info'`, `'warn'`, `'error'`, `'none'` | `'warn'`
| storageType | string (StorageType) | Where tokens are stored; localStorage, sessionStorage, Web Worker. Worker is recommended for better security. | `'local'`, `'session'`, `'worker'` | `'local'` (for backwards compatibility) |
| customParams | object | Custom URI parameters to append to the authorization URL | - | - |

### Misc. Details<a id="misc-details"></a>

#### Multiple Clients on a Page

The OidcClient supports multiple instances out of the box, allowing you to manage multiple tokens on the same page. Please note that the OidcClient class uses state to ensure that the correct client instance is processing the token or authorization code when the user is redirected back to the app from the authorization server. If you do not provide state through the ClientOptions a random string is created for you.

#### Implementation Details:

Some authorization servers, such as Ping Identity's, support and take advantage of custom params in the querystring of an /authorize endpoint call. When initiating this SDK, you can optionally pass in an object of name:value pairs that will be parsed, encoded and appended to the querystring. See the [ClientOptions Parameter Details](#options-details) above.

When using `authorize()` you can optionally pass in a login_hint parameter as a string if you have already collected a username or email from the user. The authorize function will build the url and navigate the current browser tab to it for you. Alternatively if you would like to get the authorization url ahead of time and trigger the navigation to the server yourself via an anchor href or click event, you can do so using the `authorizeUrl()` function instead. When using PKCE (which is enabled by default) the SDK will generate a code verifier and challenge for you and use the verifier when getting a token from the token_endpoint on the authorization server.

After a user has authorized on the server they will be redirected back to your app with a token in the url fragment (implicit grants) or with a `code` in the query string (`grant_type: 'authorization_code'`). The SDK will check for both cases when it is initialized and handle getting the token for you. It will also remove the token or code from the url and browser history. If you need the token from the SDK, use the `getToken()` function, the token response from that call also includes the state you passed through the clientOptions. The SDK will attempt to `JSON.parse` the state when it received from the authorization server, but if that fails it will be stored as a string.

**TokenResponse is as follows (this is a TypeScript interface, `?` indicates an optional property)**

``` TypeScript
export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  scope: string;
  token_type: string;
  state: string | any;
}
```

### Requesting Enhancements, community support, or Reporting Issues<a id="requests-issues"></a>

Use the standard [github Issues list](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/issues/new) to make these types of requests or reports, and please apply the proper label.

### Known Gotchas<a id="gotchas"></a>
- **`Error: Missing class properties transform`**
We've seen this error in React projects where dependencies had been "ejected". (*Could apply to other JS frameworks*). If you get this error, the fix is to apply this package, [babel plugin transform class properties](https://www.npmjs.com/package/babel-plugin-transform-class-properties).
*If you've ejected your dependencies, you will need to manually configure webpack config file in the babel-loader section.*

- **Salesforce Lightning Development**
 -- Lightning and static resources with async functions cause known cross-browser compatibility issues. Lightning addresses this in the docs with a solution from babeljs.
 [Transform async to generator](https://developer.salesforce.com/docs/platform/lwc/guide/security-lwsec-async.html).
 -- Lightning does not typically allow custom code to access/install external packages or modules, and therefore have to be downloaded and put on their CDN. For this, we recommend you use the `unpkg.com` URL we provide above in the [Usage without node/npm](#usage-without-nodenpm).
 -- One other consideration, we've seen how the development framework for Salesforce Lightning wraps the operations of the `promise` object. This hasn't been the root cause of any experiences thus far, but is something to consider if you see anomalous behavior.

### Disclaimer<a id="disclaimer"></a>
THIS ENTIRE PROJECT AND ALL ITS ASSETS IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS PROJECT CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.