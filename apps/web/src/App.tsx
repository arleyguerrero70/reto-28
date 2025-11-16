import { Route, Routes, NavLink } from 'react-router-dom';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { SuperUser } from './pages/SuperUser';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Reto 28 días</h1>
        <nav>
          <NavLink to="/" end>Onboarding</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/super">Super Usuario</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/super" element={<SuperUser />} />
        </Routes>
      </main>
    </div>
  );
}


