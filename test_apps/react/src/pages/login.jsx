import { useEffect, useRef } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { initializeOidc } from '../utils/initialize-oidc';

export function Login({ authWithPopup }) {
  const oidcClient = useRef();
  const navigate = useNavigate();

  const authorize = async () => {
    try {
      if (authWithPopup) {
        const popup = window.open('about:blank', 'popup', 'popup=true,width=400,height=600');
        await oidcClient.current.authorizeWithPopup(popup /*, optional login_hint (e.g. username) */);
        navigate({
          pathname: '/dashboard',
          search: createSearchParams({ popup: true }).toString(),
        });
      } else {
        oidcClient.current.authorize(/* optional login_hint (e.g. username) */);
      }
    } catch (error) {
      console.log('An error occurred attempting to authorize', error);
    }
  };

  /**
   * Initializes the SDK when the app loads.
   */
  useEffect(() => {
    async function initialize() {
      const client = await initializeOidc(authWithPopup ? 'close' : 'dashboard');
      oidcClient.current = client;

      if (await client.hasToken()) {
        navigate({
          pathname: '/dashboard',
          search: createSearchParams({ popup: authWithPopup }).toString(),
        });
      }
    }

    initialize().catch(console.error);
  }, [navigate, authWithPopup]);

  return (
    <div className="app">
      <Header />
      {/* {oidcClient.current && ( */}
      <div>
        <h3 className="app-subheader">Login with {authWithPopup ? 'Popup' : 'Redirect'}</h3>
        <button className="app-link" onClick={authorize}>
          Click this to test your changes <br /> against a Ping OIDC authorize endpoint
        </button>
        <div className="app-example-user">
          <strong>Test user:</strong>&nbsp;demouser1 / 3FederateM0re!
        </div>
      </div>
      {/* )} */}
    </div>
  );
}
