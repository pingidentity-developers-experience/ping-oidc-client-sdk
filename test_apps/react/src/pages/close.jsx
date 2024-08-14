import { Header } from '../components/header';

export function Close() {
  // This needs to be in a short delay or the window will close before dashboard is updated
  setTimeout(() => {
    if (!window.closed) window.close();
  }, 200);
  return (
    <div className="app">
      <Header />
      <div className="close-msg">This tab should close automatically, you may close it if it doesn't</div>
    </div>
  );
}
