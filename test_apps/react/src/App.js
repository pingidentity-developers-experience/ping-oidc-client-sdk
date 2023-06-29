/**
 * OAuth/OIDC SDK implementation example app 
 * Ping Identity
 * @author Technical Enablement Demo Team
 * @description A bare-bones sample app built with create-react-app (CRA) to show an implementation example. 
 * The SDK is not based on React. CRA just makes it easy to bootstrap a quick Javascript app to prototype or test.
 * @see https://react.dev/learn/start-a-new-react-project
 */

import { OidcClient } from '@pingidentity-developers-experience/ping-oidc-client-sdk';
import logo from './logo.svg';
import './App.css';

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';

export default function OidcExample() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

/**
 * Functional component that makes up this example app and renders the UI.
 * This component, called "App", is instantiated (invoked) from the main entry point of the app, index.js.
 * 
 */
function App() {
  const oidcClient = useRef();
  
  const [token, setToken] = useState();
  const [userInfo, setUserInfo] = useState();
  const [, setOidcReady] = useState(false);

  const authorize = async () => {
    try {
      oidcClient.current.authorize(/* optional login_hint (e.g. username) */)
    } catch(error) {
      console.log('An error occurred attempting to authorize', error);
    }
  }

  const revokeToken = async () => {
    try {
      await oidcClient.current.revokeToken(); 
      setToken();
    } catch (error) {
      console.log('An error occurred attempting to revoke token', error);
    }
  }

  const signOff = () => {
    oidcClient.current.endSession('https://localhost:3000');
  }

  const refreshToken = async () => {
    try {
      const token = await oidcClient.current.refreshToken();
      console.log(token);
    } catch (error) {
      console.log('An error occured using refreshToken');
    }
  }

  /**
   * Initializes the SDK when the app loads.
   */
  useEffect(() => {
    async function initializeOidc() {
      const clientOptions = {
        client_id: '6e610880-8e52-4ba7-a2dc-c5f9bd80f3ee',
        redirect_uri: 'https://localhost:3000',
        scope: 'openid profile email revokescope', // defaults to 'openid profile email'
        // response_type: 'token', // defaults to 'code'
        // usePkce: false, // defaults to true
        // state: 'xyz', // will apply a random state as a string, you can pass in a string or object
        // logLevel: 'debug', // defaults to 'warn'
        storageType: 'worker' // defaults to 'local'. Also falls back to 'local' for backwards compatibility when choosing 'worker' and the Worker object is not present.
      };
  
      /**
       * Dynamically fetches your OAuth authorization servers endpoints from the spec-defied .well-known endpoint.
       */
      const client = await OidcClient.initializeFromOpenIdConfig('https://auth.pingone.com/b28c6458-9fc0-49cf-bf19-b7aaab1e7be7/as', clientOptions);
      oidcClient.current = client;
      setOidcReady(true);

      if (await client.hasToken()) {
        const token = await client.getToken();
        setToken(token);
        
        console.log('state', token.state)
        
        try {
          const userInfo = await oidcClient.current.fetchUserInfo();
          setUserInfo(userInfo);
        } catch (error) {
          console.log('An error occurred attempting to fetch user info token is likely expired', error);
          const token = await oidcClient.current.refreshToken();
          setToken(token);
          const userInfo = await oidcClient.current.fetchUserInfo();
          setUserInfo(userInfo);
        }
      }
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
      {!token && oidcClient.current &&
        <div>
          <button className="app-link" onClick={authorize}>
            Ping OIDC Authorize URL
          </button>
          <div className="app-example-user"><strong>Test user:</strong>&nbsp;demouser1 / 2FederateM0re!</div>
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
              {oidcClient.current && <button className="app-revoke-button" onClick={revokeToken}>Revoke Token</button>}
              {oidcClient.current && <button className="app-signoff-button" onClick={signOff}>Sign Off</button>}
              {oidcClient.current && <button className="app-signoff-button" onClick={refreshToken}>Refresh Token</button>}
          </div>
        </>
      }
    </div>
  );
}

