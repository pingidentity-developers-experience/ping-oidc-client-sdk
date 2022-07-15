/**
 * Ping Identity
 * Library representing OIDC and OAuth endpoints.
 * Implements a library to integrate with PingFederate authorization server endpoints.
 * As much as possible, this library will simplify the OAuth/OIDC protocol flows.
 * For example, the authorization code grant flow requires a get auth code call,
 * then a follow-up call to swap the code for an access token. This can be wrapped up
 * in a single get token call because there is no reason to trouble the developer with
 * logic we can infer/presume based on protocol specs and application input.
 *
 * @author Technical Enablement Demo Team, Ping Identity.
 * @version 0.1.0
 * @see https://docs.pingidentity.com/bundle/pingfederate-110/page/qom1564002958524.html
 * @see https://docs.pingidentity.com/bundle/pingfederate-110/page/lhk1564003024628.html
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-regext-rdap-openid
 * @see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-01
 * @see https://datatracker.ietf.org/doc/html/rfc6749
 */

import utils from './utils/index';

// These are static and private because they are defined by
// the OIDC spec and implemented by PingFederate.
// Other OAuth endpoints are defined in ping.as.oauth.
// const wellKnownEndpointURI = '/.well-known/openid-configuration';
const authzEndpointURI = '/as/authorization.oauth2';
const tokenEndpointURI = '/as/token.oauth2';
// const introspectEndpointURI = '/as/introspect.oauth2';
// const tokenRevocationEndpointURI = '/as/revoke_token.oauth2';
// const userInfoEndpointURI = '/idp/userinfo.openid';
// const cibaEndpointURI = '/as/bc-auth.ciba';
// const grantsMgmtEndpointURI = '/as/oauth_access_grants.ping';
// const dynamicClientRegEndpointURI = '/as/clients.oauth2';
// const deviceAuthzEndpointURI = '/as/device_authz.oauth2';
// const userAuthzEndpointURI = '/as/user_authz.oauth2';
// const pushedAuthzEndpointURI = '/as/par.oauth2';

/**
 * * This OIDC module wraps the OAuth module. OAuth does not require OIDC and can be used independently.
 * So why import OIDC specifics if they are not used. OIDC module just inherits OAuth for more flexible design.
 * @module PingAsOidc
 * @param {string} oidcConfig The required OAuth params in JSON format.
 */

interface Configs {
  basePath: string;
  clientID: string;
  clientSecret?: string;
  redirectURI: string;
}

class PingAsOidc {
  configs: Configs;

  utils: {
    generateCodeChallenge(codeVerifier: string): Promise<string>;
    getRandomString(length: number): string;
  };

  /**
  Class Constructor
  @param {object} configs Path to your PingFederate runtime engine nodes.
  */
  constructor(configs: Configs) {
    this.configs = configs;
    this.utils = utils;
  }

  /**
  Get Authorization URL
  Creates client specific authorization url
  @param {string} responseType oAuth grant type
  @param {string} [scopes] additional access requested by the application
  @param {string} [state] parameter used by the application to store request-specific data and/or prevent CSRF attacks
  @returns {string} 
  */
  async getAuthorizationURL(responseType: string, scopes = '', state = ''): Promise<string> {
    let url = `${this.configs.basePath}${authzEndpointURI}?response_type=${responseType}&client_id=${this.configs.clientID}&redirect_uri=${this.configs.redirectURI}&scope=${scopes}`;

    if (responseType === 'code') {
      const codeVerifier = this.utils.getRandomString(128);
      let codeChallenge: string;

      try {
        codeChallenge = await this.utils.generateCodeChallenge(codeVerifier);
      } catch (e) {
        console.error('Generating code challenge failed', e);
      }

      // Save pkce code_verifier and state values
      sessionStorage.setItem('state', state);
      sessionStorage.setItem('codeVerifier', codeVerifier);

      url = url.concat(`&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`);
    }

    return url;
  }

  /**
  OAuth Token:
  Swaps an OAuth code for an OAuth access token.
  @see https://docs.pingidentity.com/bundle/pingfederate-103/page/xhx1564003025004.html
  @param {string} code Authorization code from AS.
  @param {string} redirectURI App URL user should be redirected to after swap for token.
  @param {string} clientId client ID for the OAuth client being used.
  @param {string} clientSecret client secret for the OAuth client being used.
  @returns {object} JSON formatted response object.
  */
  async getToken(code: string) {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Basic ${btoa(`${this.configs.clientID}:${this.configs.clientSecret}`)}`);
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    const urlencoded = new URLSearchParams();
    urlencoded.append('grant_type', 'authorization_code');
    urlencoded.append('code', code);
    urlencoded.append('redirect_uri', this.configs.redirectURI);
    urlencoded.append('code_verifier', sessionStorage.getItem('codeVerifier'));

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'manual',
    };

    const url = this.configs.basePath + tokenEndpointURI;
    const response = await fetch(url, requestOptions);
    const jsonResponse = await response.json();
    return jsonResponse;
  }
}

export default PingAsOidc;
