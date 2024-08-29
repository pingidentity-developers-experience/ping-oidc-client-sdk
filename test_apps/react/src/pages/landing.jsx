import { Link } from 'react-router-dom';
import { Header } from '../components/header';

export function Landing() {
  return (
    <div className="app">
      <Header />
      <div>
        <div className="app-subheader">Welcome please select a login method to test:</div>
        <Link className="app-link" to="/login-redirect">
          Login with Redirect
        </Link>
        <Link className="app-link" to="/login-popup">
          Login with Popup
        </Link>
      </div>
    </div>
  );
}
