import { Component } from '@angular/core';
import { OidcClient, TokenResponse, StorageType } from '@pingidentity-developers-experience/ping-oidc-client-sdk';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'angular-oidc';
  oidcClient?: OidcClient;
  token?: TokenResponse;
  userInfo?: any;

  constructor() {
    this.init();
  }

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
        console.log(token);
        this.tokenAvailable(token);
      }
    } catch (err) {
      console.error('Error initializing OidcClient', err);
    }
  }

  authorizeUser() {
    this.oidcClient?.authorize();
  }

  async revokeToken() {
    await this.oidcClient?.revokeToken();
    window.location.reload();
  }

  async tokenAvailable(token: TokenResponse) {
    this.token = token;
    console.log('state', token.state);

    try {
      this.userInfo = await this.oidcClient?.fetchUserInfo();
    } catch {
      this.token = (await this.oidcClient?.refreshToken()) || undefined;
      this.userInfo = await this.oidcClient?.fetchUserInfo();
    }
  }

  signOff() {
    this.oidcClient?.endSession('http://localhost:4200');
  }
}
