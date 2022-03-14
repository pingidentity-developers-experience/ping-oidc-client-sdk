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

// These are static and private because they are defined by
// the OIDC spec and implemented by PingFederate.
// Other OAuth endpoints are defined in ping.as.oauth.
const wellKnownEndpointURI = '/.well-known/openid-configuration';
const authzEndpointURI = '/as/authorization.oauth2?';
const tokenEndpointURI = '/as/token.oauth2?';
const introspectEndpointURI = '/as/introspect.oauth2';
const tokenRevocationEndpointURI = '/as/revoke_token.oauth2';
const userInfoEndpointURI = '/idp/userinfo.openid';
const cibaEndpointURI = '/as/bc-auth.ciba';
const grantsMgmtEndpointURI = '/as/oauth_access_grants.ping';
const dynamicClientRegEndpointURI = '/as/clients.oauth2';
const deviceAuthzEndpointURI = '/as/device_authz.oauth2';
const userAuthzEndpointURI = '/as/user_authz.oauth2';
const pushedAuthzEndpointURI = '/as/par.oauth2';

// TODO Testing values. Remover before publish.
const code_verifier =
    'Z7tkINgI-b2ftB_qgsFBHXSRK79gdTkNdTFeyk5fRZ-3bFrEWHzn.06XBg7Q-rd0yoFYrQ2c8nAkLpJ9cHc6QoI__eAwz0wQFkD_T3Jwr5xkqVYJwDzsdnT_zMcGa~Rk';
const code_challenge = '3miT2HK8Mo-KBfEyi4DAmo7uRYuqySPdUF1CEC91ty8';

/**
 * * This OIDC module wraps the OAuth module. OAuth does not require OIDC and can be used independently.
 * So why import OIDC specifics if they are not used. OIDC module just inherits OAuth for more flexible design.
 * @module oidc
 * @param {string} oidcConfig The required OAuth params in JSON format.
 */
const oidc = () => {
    console.info('oidc');

    // OAuth grant type. Defaulted to 'code', the most secure grant.
    const respsonseType = 'code';
    // Where the access token will be sent.
    const redirectURI = '';
    // ID of the OAuth client used for authorization.
    const clientId = '';
    // Secret for the OAuth client used for authorization.
    const clientSecret = '';

    // Switch through grant types, or split them out as separate functions?
    switch (responseType) {
        case 'code':
            // implementation
            break;
        case 'client_credentials':
            // implementation
            break;
        case 'implicit':
            console.warn(
                'ping-as-oidc.getToken',
                'The implicit grant type is being deprecated by the IETF. Code grant type is recommended. See Oauth 2.1 specs.'
            );
            // implementation
            break;
        case 'ropc':
            console.warn(
                'ping-as-oidc.getToken',
                'The ROPC grant type is being deprecated by the IETF. Code grant type is recommended. See Oauth 2.1 specs.'
            );
            // implementation
            break;
    }
};

/**
 * Well-known endpoint module.
 * @module oidc/well_Known
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An authorization code.
 */
const well_Known = () => {
    let providerConfigInfo;

    // This function just wraps all the standard oauth functions above.
    // If the developer has no requirement to control the oauth protocol flows
    // for internal business logic, then they can make a simple single call to handle it all.
    // authorize call
    // swap code call
    // optional introspect call????

    return providerConfigInfo;
};

/**
 * Userinfo endpoint module.
 * @module oidc/userinfo
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An authorization code.
 */
const userinfo = (accessToken) => {
    let resourceOwnerInfo;

    // This function just wraps all the standard oauth functions above.
    // If the developer has no requirement to control the oauth protocol flows
    // for internal business logic, then they can make a simple single call to handle it all.
    // authorize call
    // swap code call
    // optional introspect call????

    return resourceOwnerInfo;
};

/**
 * OAuth authorization module.
 * @module oauth/authorize
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An authorization code.
 */
const authorize = ({
    clientId,
    responseType = 'code',
    codeChallenge,
    codeChallengeMethod,
    state,
    fullRedirect = false,
} = {}) => {
    // TODO  needs  abstracted private logging module. FYI, arguments object doesn't exist with arrow functions.

    // values for unit testing.
    // ID of the OAuth client used for authorization.
    // const clientId = 'ac_client';
    // Secret for the OAuth client used for authorization.
    // const clientSecret = 'p3G97lteYZgDdsXhwQj8Ld38WKOrKjY2RprB1GO88nAVjTswLaoA1tRaZGBUrAcV';

    /* 
  If your app is not handling authentication, we redirect the client/browser 
  to PingFederate. This assumes you do NOT have "Allow Authentication API OAuth Initiation" 
  checked in your client settings.
  */
    // TODO this needs to be built from args, obviously.
    const authzEndpoint =
        '/as/authorization.oauth2?client_id=ac_client&response_type=code&code_challenge=3miT2HK8Mo-KBfEyi4DAmo7uRYuqySPdUF1CEC91ty8&code_challenge_method=S256&state=california';
    if (fullRedirect) {
        console.info('ping-as-oauth', 'Redirecting the client to PingFederate authorize endpoint.');
        window.location.assign(authzEndpoint);
    }

    // Switch through grant types, or split them out as separate functions?
    switch (responseType) {
        case 'code':
            const axios = require('axios');
            const qs = require('qs');
            let data = qs.stringify({
                'pf.username': 'sarah',
                'pf.pass': '2FederateM0re!',
            });
            let config = {
                method: 'get',
                url: authzEndpoint,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization:
                        'Basic YWNfY2xpZW50OnAzRzk3bHRlWVpnRGRzWGh3UWo4TGQzOFdLT3JLalkyUnByQjFHTzg4bkFWalRzd0xhb0ExdFJhWkdCVXJBY1Y=',
                },
                timeout: 10,
                data: data,
            };

            axios(config)
                .then((response) => {
                    console.log(JSON.stringify(response.data));
                })
                .catch((error) => {
                    console.log(error);
                });
            break;
        case 'client_credentials':
            // implementation
            break;
        case 'implicit':
            console.warn(
                'ping-as-oidc.authorize',
                'The implicit grant type is being deprecated by the IETF. Code grant type is recommended. See Oauth 2.1 specs.'
            );
            // implementation
            break;
        case 'ropc':
            console.warn(
                'ping-as-oidc.authorize',
                'The ROPC grant type is being deprecated by the IETF. Code grant type is recommended. See Oauth 2.1 specs.'
            );
            // implementation
            break;
    }

    return;
};

/**
 * Swap code for token module.
 * @module oauth/swapCodeForToken
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An access token.
 */
const swapCodeForToken = ({ clientId, responseType = 'code', codeChallenge, codeChallengeMethod, state } = {}) => {
    let accessToken;

    return accessToken;
};

/**
 * Get token easy button module.
 * @module oauth/getTokenEasy
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An authorization code.
 */
const getTokenEasy = ({ clientId, responseType = 'code', codeChallenge, codeChallengeMethod, state } = {}) => {
    let accessToken;

    // This function just wraps all the standard oauth functions above.
    // If the developer has no requirement to control the oauth protocol flows
    // for internal business logic, then they can make a simple single call to handle it all.
    // authorize call
    // swap code call
    // optional introspect call????

    return accessToken;
};

/**
 * Introspect token module.
 * @module oauth/introspectToken
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An authorization code.
 */
const introspectToken = ({ clientId, responseType = 'code', codeChallenge, codeChallengeMethod, state } = {}) => {
    let tokenData;

    // This function just wraps all the standard oauth functions above.
    // If the developer has no requirement to control the oauth protocol flows
    // for internal business logic, then they can make a simple single call to handle it all.
    // authorize call
    // swap code call
    // optional introspect call????

    return tokenData;
};

/**
 * Refresh token module.
 * @module oauth/refreshToken
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @param {*} param0
 * @returns {string} An authorization code.
 */
const refreshToken = ({ clientId, responseType = 'code', codeChallenge, codeChallengeMethod, state } = {}) => {
    let refreshedAccessToken;

    // This function just wraps all the standard oauth functions above.
    // If the developer has no requirement to control the oauth protocol flows
    // for internal business logic, then they can make a simple single call to handle it all.
    // authorize call
    // swap code call
    // optional introspect call????

    return refreshedAccessToken;
};

export { oidc };
