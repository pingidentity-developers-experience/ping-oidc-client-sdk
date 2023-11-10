# Getting Started with the Angular Test App

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.1.

---
### This test app is intended for developers contributing to this project. This is not for demos or intended to be a sample app.
### For an example of integrating this OIDC SDK with your custom app, please check out our OIDC SDK example integration package in our [Ping example integrations library](https://github.com/pingidentity-developers-experience/ping-integration-example-packages).
---

## Prepping the project for your development

1. If you plan to contribute and submit pull requests, be sure to read the contributor's guide found in the root .github folder, or online at [CONTRIBUTING.MD](https://github.com/pingidentity-developers-experience/ping-oidc-client-sdk/blob/main/.github/CONTRIBUTING.md)
1. `cd` into the project/repo root folder and run, `npm install`
1. Then run, `npm run build`
1. `cd` into the test_apps/angular directory and run, `npm install`
1. Then run, `npm link ../../`
1. Your project is now ready to spin up. Just run, `ng serve`

This runs the app in development mode.\
Open [http://localhost:4200](http://localhost:4200) to view it in your browser.

The page will reload if you make changes to the test app.\
You may also see any lint errors in the console.

When you make changes to the SDK source code, be sure to re-run step #3 above in the project/repo root folder.

## Customizing the Test App
You can point the test app to your own environment or authorization server by updating the `clientOptions` param and the host path to your .well-known endpoint

``` Javascript
  async init() {
    try {
      this.oidcClient = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/b28c6458-9fc0-49cf-bf19-b7aaab1e7be7/as', {
        client_id: '6e610880-8e52-4ba7-a2dc-c5f9bd80f3ee',
        redirect_uri: 'http://localhost:4200',
        scope: 'openid profile email revokescope', // defaults to 'openid profile email'
        storageType: StorageType.Local,
      });

      if (await this.oidcClient.hasToken()) {
        const token = await this.oidcClient.getToken();
        this.tokenAvailable(token);
      }
    } catch (err) {
      console.error('Error initializing OidcClient', err);
    }
  }
```

in `/src/app/home.component.ts`.

After you've made your changes, save the file and the app should reload with the new values.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


