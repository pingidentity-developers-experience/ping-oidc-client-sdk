/**
 * OAuth/OIDC SDK Sample App 
 * Ping Identity
 * @author Technical Enablement Demo Team
 * @description A bare-bones sample app built with create-react-app (CRA) to show an implementation example.
 * @see https://react.dev/learn/start-a-new-react-project
 */

import OidcClient from '@ping-identity-developer-enablement/dev-enablement-oidc';
import logo from './logo.svg';
import './App.css';

import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

export default function OidcExample() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

function App() {
  const [token, setToken] = useState();
  const [oidcClient, setOidcClient] = useState();
  const [userInfo, setUserInfo] = useState();

  const tokenAvailable = async token => {
    setToken(token);
    try {
      const userInfo = await oidcClient?.fetchUserInfo();
      setUserInfo(userInfo);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function initializeOidc() {
      const clientOptions = {
        clientId: '6dea3779-356d-4222-935b-3a0b4e03b655',
        redirectUri: 'https://localhost:3000',
        // grantType: 'token', // defaults to 'authorization_code'
        // usePkce: false, // defaults to true
        // clientSecret: 'xxx', // required if using clientSecretAuthMethod (not recommended in client side apps, pkce prefered)
        // clientSecretAuthMethod: 'basic', // omitted by default
        // scope: 'openid profile revokescope', // defaults to 'openid profile'
        // state: 'xyz', // will apply a random state as a string, you can pass in a string or object
        // logLevel: 'info', // defaults to 'warn'
        tokenAvailableCallback: tokenAvailable,
      };
  
      const oidcClient = await OidcClient.fromIssuer('https://auth.pingone.com/cc8801c7-a048-4a4f-bbc3-7a2604ca449a/as', clientOptions);
      setOidcClient(oidcClient);
    };

    initializeOidc()
      .catch(console.error);
   }, []);

  const revokeToken = async () => {
    if (!oidcClient) {
      return;
    }

    await oidcClient.revokeToken(); 
    setToken();
  }

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1>OIDC Client Sample App</h1>
      </header>
      {!token &&
        <div>
          <button className="app-link" onClick={() => oidcClient.authorize(/* optional login_hint (e.g. username) */)}>
            Ping OIDC Authorize URL
          </button>
        </div>}
      {token &&
        <>
          <div className="app-content">
            <h3 className="app-token-label">Token:</h3>
            <div className="app-token-container">
              <strong>Access Token:</strong>
              <div>{token.access_token}</div>
            </div>
            <div className="app-token-container">
              <strong>ID Token:</strong> 
              <div>{token.id_token}</div> 
            </div>
            {userInfo &&
              <>
                <hr />
                <div>
                  <h3 className="app-token-label">User Info:</h3>
                  {Object.keys(userInfo).map(key => <div key={key}><span className="app-userinfo-label">{key}:</span>{userInfo[key]}</div>)}
                </div>
              </>}
              {oidcClient && <button className="app-revoke-button" onClick={revokeToken}>Revoke Token</button>}
          </div>
        </>
      }
    </div>
  );
}

