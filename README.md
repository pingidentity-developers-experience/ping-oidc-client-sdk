# Developer Enablement OIDC package
## Technical Enablement, Ping Identity
### Authors: Michael Sanchez, Jon Oblander

#### Contributors: Zhanna Avenesova, Eric Anderson, Kristina Salgado

This project is a collection of re-usable modules (hosted at npmjs.com), for bootstrapping the OpenID Connect (OIDC) protocol, with the intent to automate or simplify steps in the protocol flow. This allows you, the developer, to do what you do best, focusing on your companies business apps, while Ping Identity handles what we does best, identity security.

The code included has a prediliction for security best practices, obviously. But considering the use cases and needs of the wider audience of Ping's customers, there are optional parameters included to utilize other options that will log warnings to let you know you have chosen lesser secure options.

With a developer-first focus and simplicity in design, native Javascript APIs were chosen over 3rd-party packages and libraries which may conflict with your companies security standards. Additionally, native Javascript APIs simplify maintenance for Ping and its customers, and lessens the threat landscape in your applications. NPM transient dependencies can run deep. The one exception we made was choosing Axios over fetch() for HTTP requests. This may change at our discretion should Axios dependencies begin to outweigh the benefits.

*DO NOT* clone this source code and add it to your projects source code. All packages are hosted in NPM and can simply be added to your package.json file.
Of course, if you are working on traditional, plain old JavaScript apps, then cloning is your only option. We do not offer hosting our libraries on a CDN.

#### Authorization Code Example:

*Prerequisites*
PingFederate Authorization server and oAuth client that supports authorization code grant type.

##### Option 1: Install oidc library into your project using npm:

```javascript
npm install @ping-identity-developer-enablement/dev-enablement-oidc
```

Import the PingFederate OIDC module:

```javascript
import { pingAsOidc } from '@ping-identity-developer-enablement/dev-enablement-oidc';
```

##### Option 2: Manaully include oidc library into your project using script tag:

```javascript
<script src="https://cdn.jsdelivr.net/npm/@ping-identity-developer-enablement/dev-enablement-oidc@0.1.0-alpha/dist/index.min.js"></script>
```

Initiate config options:

```javascript
  const configs = {
    /** PingFederate base path */
    BasePath: 'https://yourpfbasepath.com',
  }
```

Instantiate a new OIDC client:

```javascript
// Via imported npm package
const oidcClient = new pingAsOidc(configs);
```

*OR*

```javascript
// Via manually included javascript file
const oidcClient = new pingDevLib.pingAsOidc(configs);
```

Initiate authorization url config options:

```javascript
      const options = {
        ClientId: 'client_id',
        Scope: 'openid profile',
        RedirectUri: 'https://localhost:3000/app',
        ResponseType: 'code',
        PkceRequest: true,
        CodeChallengeMethod: 'S256'
      }
```

Call authorize method of OIDC library to generate redirect url:

```javascript
      oidcClient.authorize(options).then(authUrl => {
        // Redirect to authorization url
        window.location.assign(authUrl);
      }).catch(err => console.log(err));
```

Call getToken method to exchange authorization code for access token (id_token):

```javascript
      oidcClient.getToken(
          'code', 
          'redirect_uri',  
          'client_id', 
          'client_secret'
      )
      .then(response => {
        console.log(response.access_token);
        console.log(response.id_token);
      })
      .catch(err => console.log(err))
```