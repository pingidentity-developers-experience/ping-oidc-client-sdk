import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/header';
import { initializeOidc } from '../utils/initialize-oidc';

export function Dashboard() {
  const oidcClient = useRef();

  const [token, setToken] = useState();
  const [userInfo, setUserInfo] = useState();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const revokeToken = async () => {
    try {
      await oidcClient.current.revokeToken();
      setToken();
      navigate('/');
    } catch (error) {
      console.log('An error occurred attempting to revoke token', error);
    }
  };

  const signOff = async () => {
    const authWithPopup = searchParams.get('popup') === 'true';
    await oidcClient.current.endSession(`${window.location.origin}/${authWithPopup ? 'close' : ''}`);

    if (authWithPopup) {
      navigate('/');
    }
  };

  const refreshToken = async () => {
    try {
      const token = await oidcClient.current.refreshToken();
      console.log(token);
    } catch (error) {
      console.log('An error occured using refreshToken');
    }
  };

  /**
   * Initializes the SDK when the app loads.
   */
  useEffect(() => {
    async function initialize() {
      const authWithPopup = searchParams.get('popup') === 'true';
      const client = await initializeOidc(authWithPopup ? 'close' : 'dashboard');
      oidcClient.current = client;

      if (await client.hasToken()) {
        const token = await client.getToken();
        setToken(token);

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
      } else {
        navigate('/');
      }
    }

    initialize().catch(console.error);
  }, [navigate, searchParams]);

  return (
    <div className="app">
      <Header />
      {token && (
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
            {userInfo && (
              <>
                <hr />
                <div>
                  <h3 className="app-token-label">User Info:</h3>
                  {Object.keys(userInfo).map((key) => (
                    <div key={key}>
                      <span className="app-userinfo-label">{key}:</span>
                      {userInfo[key]}
                    </div>
                  ))}
                </div>
              </>
            )}
            {oidcClient.current && (
              <button className="app-revoke-button" onClick={revokeToken}>
                Revoke Token
              </button>
            )}
            {oidcClient.current && (
              <button className="app-signoff-button" onClick={signOff}>
                Sign Off
              </button>
            )}
            {oidcClient.current && (
              <button className="app-signoff-button" onClick={refreshToken}>
                Refresh Token
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
