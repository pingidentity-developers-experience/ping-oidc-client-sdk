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
  const [loginHint, setLoginHint] = useState('');

  useEffect(() => {
    async function initializeOidc() {
      const clientOptions = {
        redirectUri: 'https://localhost:3000',
        clientId: '6dea3779-356d-4222-935b-3a0b4e03b655',
        logLevel: 'info',
        // usePkce: false,
        // grantType: 'token',
        tokenAvailableCallback: async token => {
          setToken(token);
          try {
            const userInfo = await oidcClient.fetchUserInfo();
            setUserInfo(userInfo);
          } catch (error) {
            console.log(error);
           }
        }
      };
  
      const oidcClient = await OidcClient.fromIssuer('https://auth.pingone.com/cc8801c7-a048-4a4f-bbc3-7a2604ca449a/as', clientOptions);
      setOidcClient(oidcClient);
    };

    initializeOidc()
      .catch(console.error);
   }, []);

  return (
    <div className="app">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1>OIDC Client Sample App</h1>
      </header>
      {!token &&
        <>
          <div className="app-hint">
            <label>Login Hint</label>
            <input id="loginHint" value={loginHint} onChange={e => setLoginHint(e.target.value)} />
          </div>
          <div>
            <button className="app-link" onClick={() => oidcClient.authorize(loginHint)}>
              Ping OIDC Authrorize URL
            </button>
          </div>
        </>}
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
              {oidcClient && <button className="app-revoke-button" onClick={() => oidcClient.revokeToken()}>Revoke Token</button>}
          </div>
        </>
      }
    </div>
  );
}

