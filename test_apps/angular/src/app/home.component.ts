import { Component, NgZone } from '@angular/core';
import { LogLevel, OidcClient, TokenResponse } from '@pingidentity-developers-experience/ping-oidc-client-sdk';

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

  constructor(private zone: NgZone) {
    this.init();
  }

  async init() {
    try {
      this.oidcClient = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/cc8801c7-a048-4a4f-bbc3-7a2604ca449a/as', {
        client_id: '6dea3779-356d-4222-935b-3a0b4e03b655',
        redirect_uri: 'http://localhost:4200',
        scope: 'openid profile email revokescope', // defaults to 'openid profile email'
        tokenAvailableCallback: (token: TokenResponse, state: any) => this.zone.run(() => this.tokenAvailable(token, state)),
        logLevel: LogLevel.Debug
      });

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

  async tokenAvailable(token: TokenResponse, state: any) {
    this.token = token;
    setTimeout(async () => {
      this.userInfo = await this.oidcClient?.fetchUserInfo();
    })
  }

  signOff() {
    this.oidcClient?.endSession('http://localhost:4200');
  }
}
