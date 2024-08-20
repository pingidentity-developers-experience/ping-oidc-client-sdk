import logo from '../Pingy_Still.png';

export function Header() {
  return (
    <header className="app-header">
      <img src={logo} className="app-logo" alt="logo" title="You're using the React test app!" />
      <h1>OIDC Client Testing App</h1>
    </header>
  );
}
