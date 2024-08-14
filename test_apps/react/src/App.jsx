/**
 * OAuth/OIDC SDK testing app
 * Ping Identity
 * @author Technical Enablement Demo Team
 * @description A bare-bones test app built with create-react-app (CRA) for developers to test with.
 * The SDK is NOT based on React. CRA just makes it easy to bootstrap a quick Javascript app with which to test and prototype.
 * @see https://react.dev/learn/start-a-new-react-project
 */

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Close } from './pages/close';
import { Dashboard } from './pages/dashboard';
import { Landing } from './pages/landing';
import { Login } from './pages/login';

import './App.css';

export default function OidcExample() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login-redirect" element={<Login authWithPopup={false} />} />
        <Route path="/login-popup" element={<Login authWithPopup={true} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/close" element={<Close />} />
      </Routes>
    </BrowserRouter>
  );
}
