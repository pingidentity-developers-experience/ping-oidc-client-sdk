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

  const [authorizationUrl, setAuthorizationUrl] = useState('');
  const [token, setToken] = useState({});
  const [oidcClient, setOidcClient] = useState();
  const [userInfo, setUserInfo] = useState();
  const [message, setMessage] = useState('Ping OIDC Authrorize URL');

  useEffect(() => {
    const initializeOidc = async () => {

      const clientOptions = {
        redirectUri: 'https://localhost:3000',
        clientId: '6dea3779-356d-4222-935b-3a0b4e03b655',
        logLevel: 'debug',
        grantType: 'token',
      };
  
      const oidcClient = await OidcClient.fromIssuer('https://auth.pingone.com/cc8801c7-a048-4a4f-bbc3-7a2604ca449a/as', clientOptions);
  
      setOidcClient(oidcClient);
  
      // Hmmmm
      if (oidcClient.hasToken()) {
        const token = await oidcClient.getToken();
        setToken(token);
  
        const userInfo = await oidcClient.fetchUserInfo();
        setUserInfo(userInfo);

        console.log(userInfo);
  
        setAuthorizationUrl('/');
        setMessage('Try Again');
      } else {
        const authorizationUrl = await oidcClient.authorize(/* 'etest' */);
        setAuthorizationUrl(authorizationUrl);
  
        console.log('Authorization URL Generated', authorizationUrl);
      }
    };

    initializeOidc()
      .catch(console.error);
   }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a className="App-link" href={authorizationUrl} rel="noopener noreferrer">
          {message}
        </a>

        {message === 'Try Again' && 
          <>
            <div style={{backgroundColor: 'white', width: '90%', color: 'black', 'textAlign': 'left', fontSize: 10, padding: '2px', wordWrap: 'break-word'}}>
              <p>
                <strong>Access Token:</strong>
                <br />
                {token.access_token} 
              </p>
              <p>
                <strong>ID Token:</strong> 
                <br />
                {token.id_token} 
              </p>
              {userInfo &&
                <>
                  <hr />
                  <div>
                    <strong>User Info:</strong>
                    <br />
                    {Object.keys(userInfo).map(key => <div key={key}><span style={{display: 'inline-block', minWidth: '120px'}}>{key}:</span>{userInfo[key]}</div>)}
                  </div>
                </>}
            </div>
            {oidcClient && 
              <button onClick={() => oidcClient.revokeToken()}>Revoke Token</button>}
          </>}
        
      </header>
    </div>
  );
}

