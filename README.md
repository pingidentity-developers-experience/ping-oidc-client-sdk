# OAuth/OIDC SDK
## From Ping Identity
### Authors: Technical Enablement Demo Team

This project is an OAuth/OIDC SDK (hosted at npmjs.com), for bootstrapping the [OAuth](https://www.rfc-editor.org/rfc/rfc6749) and [OpenID Connect (OIDC)](https://openid.net/developers/specs/) protocol in your own custom applications, with the intent to automate or simplify steps in the protocol flow and integration of it. This allows you, the developer, to do what you do best, focusing on your company's business apps, while Ping Identity handles what we do best, identity security.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen as much as possible over 3rd-party packages and libraries which may conflict with your company's security standards. Additionally, native Javascript APIs simplify maintenance for Ping Identity and its customers, and reduces the potential attack vectors of this package in your applications. 

### Security

#### Best practices

For guidelines on security best practices please see [OAUTH 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-07) and [OAUTH 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics-16).

#### Software Bill of Materials

NPM transient dependencies can run deep. For this reason, we include a software bill of materials (SBOM) with each release that you or your security teams can audit. These SBOMs are generated using [CycloneDX by OWASP](https://owasp.org/www-project-cyclonedx/). Packages we import are primarily for development of the SDK and can be excluded in builds. These packages may change at our discretion.

#### Responsible Disclosure

Before each release, we run the following commands against our project to ensure a clean project. We make every reasonable effort to resolve category critical and high vulnerabilities.

`npm doctor`
`npx unimported`
`npm outdated`
`npx depcheck`
`npm audit`

Because of the as-is offering and license of this project, it is highly recommended that users of this SDK run `npm audit` and evaluate the results and  make changes to meet their internal application security requirements. Alternatively or additionally you can submit issues in our [Github repo](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/issues).

### Included:

This OAuth/OIDC Library allows you to quickly implement an OIDC flow in your Web Application. Its goal is to make it as easy as possible to authenticate a user and get an access token with as little developer intervention as possible. Currently this library only supports browser implementations.

### Getting Started:

There is an implementation example app, (not a demo), included in the project in test_apps/oidc. The test app is a React app created with the create-react-app package but usage applies with other web frameworks as well!

Install from NPM:

```
# With npm
npm install @pingidentity-developers-experience/ping-oidc-client-sdk

# With yarn
yarn add @pingidentity-developers-experience/ping-oidc-client-sdk
```



In your js file:

`import { OidcClient } from '@pingidentity-developers-experience/ping-oidc-client-sdk';`

#### Usage:
Note these examples show usage against PingOne, but the OidcClient will work against any OAuth/OIDC compliant authentication server. Also, this library is written using TypeScript so you will get typings in your app if needed.

``` JavaScript
const clientOptions = {
  client_id: '<authn-server-client-id>',
  // redirect_uri: 'https://example.com/page', 
  // response_type: 'token', 
  // usePkce: false,
  // scope: 'openid profile revokescope',
  // state: 'xyz', 
  // logLevel: 'debug',
};

// Initialize the library using an authentication server's well-known endpoint. Note this takes in the base url of the auth server, not the well-known endpoint itself. '/.well-known/openid-configuration' will be appended to the url by the SDK.
const oidcClient = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/<env-id>/as', clientOptions);

// Used to authorize a user. Note this will use window.location.assign, thus redirecting the user after the url is generated.
oidcClient.authorize(/* optional login_hint */);

// Used to get the authorization url if you wish to override the authorize() behavior and apply it to an anchor tag, for example
const authnUrl = await oidcClient.authorizeUrl(/* optional login_hint */);

// Used to get the user info from the userinfo endpoint on the auth server, must be used after user has gone through authorize flow and a token is available in storage.
const userInfo = await oidcClient.fetchUserInfo();

// Get the token from storage
const token = await oidcClient.getToken();

// If you need the state that was passed to the server, you can get it from the TokenResponse managed by the library
const state = token.state;

// Revoke the token on the server and remove it from storage
await oidcClient.revokeToken();

// Refresh the access token and store the new token in storage
await oidcClient.refreshToken();

// End the user's session using the end_session_endpoint on the auth server
await oidcClient.endSession(/* optional post logout redirect uri */);
```

We recommend you initialize the library using the static initializeFromOpenIdConfig method shown above, as this will hit the authorization server's well-known endpoint and use the endpoints defined in the response. Alternatively you can initialize an OidcClient manually.

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

#### Usage without node/npm:

If you wish to use the library in a web application that does not use node or npm you can import it from unpkg or a similar CDN and use it as follows.

``` HTML
<!-- NOTE: In most cases you should specify a version in case we release major/breaking changes, see https://www.unpkg.com/ for more information -->
<script type="module" src="https://unpkg.com/@pingidentity-developers-experience/ping-oidc-client-sdk/lib/ping-oidc.js"></script>

<script type="text/javascript">
  const client = await pingOidc.OidcClient.initializeFromOpenIdConfig({...});
</script>
```

#### ClientOptions:

| Parameter   | Type (TS enum where applicable) | Description  | Options | Default value if not specified |
| ----------- | ---- |------------- | ------- | ------------- |
| client_id (required)| string | Client id issued by the auth server for your application | - | - |
| redirect_uri | string | Redirect URI for server to send user back to | - | Current URL from browser when library was initialized |
| response_type | string | Token response type |`'code'`, `'token'`|`'code'`|
| usePkce | boolean | Whether the library will add a code challenge to the url | `true`, `false` | `true` |
| scope | string | Requested scopes for token | - | `'openid profile'` |
| state | string \| object | State passed to server | - | Random string to act as a nonce token |
| logLevel | string (LogLevel) | Logging level for statements printed to console | `'debug'`, `'info'`, `'warn'`, `'error'`, `'none'` | `'warn'`

Errors from the library are passed up to your application so that you can handle them gracefully if needed. You can catch them in try/catch block if you are using async/await or you can use the catch() method on the promise returned from the function call.

** Note: TokenResponse is as follows (this is a TypeScript interface, `?` indicates an optional property):

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

#### Implementation Details:

When using `authorize()` you can optionally pass in a login_hint parameter as a string if you have already collected a username or email from the user. The authorize function will build the url and navigate the current browser tab to it for you. Alternatively if you would like to get the authorization url ahead of time and trigger the navigation to the server yourself via an anchor href or click event, you can do so using the `authorizeUrl()` function instead. When using PKCE (which is enabled by default) the library will generate a code verifier and challenge for you and use the verifier when getting a token from the token_endpoint on the authentication server.

After a user has authorized on the server they will be redirected back to your app with a token in the url hash (implicit grants) or with a `code` in the query string (`grant_type: 'authorization_code'`). The library will check for both cases when it is initialized and handle getting the token for you. It will also remove the token or code from the url and browser history. If you need the token from the library, use the `getToken()` function, the token response from that call also includes the state you passed through the clientOptions. The library will attempt to `JSON.parse` the state when it received from the authentication server, but if that fails it will be stored as a string.

### Miscellany

- Estimated Release Schedule Overview
  - Planning and development: Q1 2023.
  - Internal beta testing period: April, 2023.
  - Feedback/updates sprint: May, 2023.
  - Early access release: June, 2023.
  - Productized and GA release: H2, 2023

### Disclaimer
THIS ENTIRE PROJECT AND ALL ITS ASSETS IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.