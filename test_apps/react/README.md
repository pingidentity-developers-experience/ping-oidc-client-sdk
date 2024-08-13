# Getting Started with the React Test App

This testing app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---
### This test app is intended for developers contributing to this project. This is not for demos or intended to be a sample app.
### For an example of integrating this OIDC SDK with your custom app, please check out our OIDC SDK example integration package in our [Ping example integrations library](https://create-react-app.dev/).
---

##Prepping the project for your development

1. If you plan to contribute and submit pull requests, be sure to read the contributor's guide found in the root .github folder, or online at [CONTRIBUTING.MD](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/blob/main/.github/CONTRIBUTING.md)
1. `cd` into the project/repo root folder and run, `npm install`
1. Then run, `npm run build`
1. `cd` into the test_apps/react directory and run, `npm install`
1. Then run, `npm link ../../`
1. Your project is now ready to spin up. Just run, `npm start`

This runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload if you make changes to the test app.\
You may also see any lint errors in the console.

When you make changes to the SDK source code, be sure to re-run step #3 above in the project/repo root folder.

## Customizing the Test App
You can point the test app to your own environment or authorization server by updating the `clientOptions` param 

``` Javascript
const clientOptions = {
        client_id: '6e610880-8e52-4ba7-a2dc-c5f9bd80f3ee',
        redirect_uri: 'https://localhost:3000',
        scope: 'openid profile email revokescope', // defaults to 'openid profile email'
        // response_type: 'token', // defaults to 'code'
        // usePkce: false, // defaults to true
        // state: 'aad23b3c5f91a14fcef2fa48994478be857576ad', // will apply a random state as a string, you can pass in a string or object
        // logLevel: 'debug', // defaults to 'warn'
        // storageType: 'worker', // 'local' | 'session' | 'worker'. defaults to 'local'. Also falls back to 'local' for backwards compatibility when choosing 'worker' and the Worker object is not present.
        // customParams: { param1: 'value1', param2: 'value2' } // will append custom parameters to the authorization url.  Expects an object with string key/values.
     };
```

and the host path to your .well-known endpoint

``` Javascript
const client = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/b28c6458-9fc0-49cf-bf19-b7aaab1e7be7/as', clientOptions);
```
in `/src/App.js`.

After you've made your changes, save the file and the app should reload with the new values.