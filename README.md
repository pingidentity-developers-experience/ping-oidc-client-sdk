# OAuth/OIDC SDK
## Ping Identity
### Authors: Technical Enablement Demo Team


This project is an OAuth/OIDC SDK (hosted at npmjs.com), for bootstrapping the [OAuth](https://www.rfc-editor.org/rfc/rfc6749) and [OpenID Connect (OIDC)](https://openid.net/developers/specs/) protocol in your own custom applications, with the intent to automate or simplify steps in the protocol flow and integration of it. This allows you, the developer, to do what you do best, focusing on your companies business apps, while Ping Identity handles what we does best, identity security.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen as much as possible over 3rd-party packages and libraries which may conflict with your companies security standards. Additionally, native Javascript APIs simplify maintenance for Ping Identity and its customers, and reduces the potential atack vectors of this package in your applications. 

### Security

#### Software Bill of Materials

NPM transient dependencies can run deep. For this reason, we include a software bill of materials (SBOM) with each release that you or your security teams can audit. These SBOMs are generated using [CycloneDX by OWASP](https://owasp.org/www-project-cyclonedx/). Packages we import are primarily for development of the SDK and can be excluded in builds. These packages may change at our discretion.

#### Responsible Disclosure

Before each release, we run the following commands against our project to ensure a clean project. We make every reasonable effort to resolve category critical and high vulnerabilities.

`npm doctor`
`npx unimported`
`npm outdated`
`npx depcheck`
`npm audit`

Because of the as-is offering and license of this project, it is highly recommended that users of this SDK run `npm audit` and evaluate the results and  make changes to meet their internal application security requirements. Alternatively or additionally you can submit issues in our [Github repo](https://github.com/Technical-Enablement-PingIdentity/dev-enablement-oidc/issues).

#### Disclaimer
THIS ENTIRE PROJECT AND ALL ITS ASSETS IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

### Included:

This OAuth/OIDC Library allows you to quickly implement an OIDC flow in your Web Application. Its goal is to make it as easy as possible to authenticate a user and get an access token with as little developer intervention as possible.

### Getting Started:

There is a sample app included in the project in test_apps/oidc, the test app is a React app created with the create-react-app package but usage applies with other web frameworks as well!

Install from NPM:

`npm install @ping-identity-developer-enablement/dev-enablement-oidc`


In your js file:

`import OidcClient from '@ping-identity-developer-enablement/dev-enablement-oidc';`

#### Usage:
Note these examples show usage against PingOne, but the OidcClient will work against any OAuth/OIDC compliant authentication server. Also, this library is written using TypeScript so you will get typings in your app if needed.

``` JavaScript
const clientOptions = {
  clientId: '<authn-server-client-id>',
  // redirectUri: 'https://example.com/page', 
  // grantType: 'token', 
  // usePkce: false,
  // clientSecret: 'xxx',
  // clientSecretAuthMethod: 'basic',
  // scope: 'openid profile revokescope',
  // state: 'xyz', 
  // logLevel: 'debug',
  tokenAvailableCallback: token => {
    console.log(token);
  },
};
  
const oidcClient = await OidcClient.fromIssuer('https://auth.pingone.com/<env-id>/as', clientOptions);

// To authorize a user (note: this will use window.location.assign, thus redirecting the user):
oidcClient.authorize(/* optional login_hint */);

// To get the authorization url (if you wish to override the authorize() behavior and apply it to an anchor tag, for example)
const authnUrl = await oidcClient.authorizeUrl(/* optional login_hint */);

// After a user has been authorized and a token is available there is a built in user info call
const userInfo = await oidcClient.fetchUserInfo();

// Revoke the token on the server and remove it from storage
await oidcClient.revokeToken();
```

We recommend you initialize the library using the static fromIssuer method shown above, as this will hit the authorization server's well-known endpoint and use the endpoints defined in the response. Alternatively you can initialize an OidcClient manaully.

``` JavaScript
const clientOptions = {
  clientId: '<authn-server-client-id>',
  tokenAvailableCallback: (token, state) => {
    console.log(token);
    console.log(state);
  },
};

const openIdConfig = {
  authorization_endpoint: "https://auth.pingone.com/<env-id>/as/authorize", // Required
  token_endpoint: "https://auth.pingone.com/<env-id>/as/token", // Required
  revocation_endpoint: "https://auth.pingone.com/<env-id>/as/revoke", // Required if using revokenToken() function
  userinfo_endpoint: "https://auth.pingone.com/<env-id>/as/userinfo" // Required if using fetchUserInfo() function
};

const client = new OidcClient(clientOptions, openIdConfig);
```

#### ClientOptions:

| Parameter   | Type (TS enum where applicable) | Description  | Options | Default value if not specified |
| ----------- | ---- |------------- | ------- | ------------- |
| clientId (required)| string | Client id issued by the auth server for your application | - | - |
| redirectUri | string | Redirect URI for server to send user back to | - | Current URL from browser when library was initialized |
| grantType | string (GrantType) | Token grant type |`'authorization_code'`, `'token'`|`'authorization_code'`|
| usePcke | boolean | Whether the library will add a code challenge to the url | `true`, `false` | `true` |
| clientSecret | string | Client secret, required if using clientSecretAuthMethod (not recommended in browser apps) | - | - |
| clientSecretAuthMethod | string (ClientSecretAuthMethod) | Client secret authn method required by server | `'basic'`, `'post'` | - |
| scope | string | Requested scopes for token | - | `'openid profile'` |
| state | string \| object | State passed to server | - | Random string to act as a nonce token |
| logLevel | string (LogLevel) | Logging level for statements printed to console | `'debug'`, `'info'`, `'warn'`, `'error'` | `'warn'`
| tokenAvailableCallback | (token: TokenResponse, state: object \| string) => void | Description | Callback that will be called if a token is found in storage or retrieved from auth server | - | - |

** Note: TokenResponse is as follows:

``` TypeScript
export interface TokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  scope: string;
  token_type: string;
}

```

#### Implementation Details:

When using `authorize()` you can optionally pass in a login_hint parameter as a string if you have already collected a username or email from the user. Alternatively if you would like to get the authorization url ahead of time and trigger the navigation to the server yourself via an anchor href or click event, you can do so using the `authorizeUrl()` function instead.

After a user has authorized on the server they will be redirected back to your app with a token in the url hash (implicit grants or `grantType: 'token'`) or with a `code` in the query string (`grantType: 'authorization_code'`). The library will check for both cases when it is initialized and handle getting the token for you. It will also remove the token or code from the url and browser history. If you don't use the tokenAvailableCallback and need to get the token at a later time, use the `getToken()` function. State will be passed as the second parameter to the tokenAvailableCallback function, if you need to get the state that was returned from the auth server this is currently the only place you can do so, the library will atempt to `JSON.parse` it, but if that fails you will get it back as a string.

