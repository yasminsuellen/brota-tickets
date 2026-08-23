import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';
import logoImage from '../assets/logo.png';
import './TopNav.css';

const NAV_LINKS = {
  CLIENTE: [
    { label: 'Início', to: '/' },
    { label: 'Descobrir', to: '/eventos' },
    { label: 'Ingressos', to: '/meus-ingressos' },
  ],
  ORGANIZADOR: [
    { label: 'Início', to: '/' },
    { label: 'Painel', to: '/organizador' },
    { label: 'Catalogo', to: '/organizador/catalogo' },
  ],
  PORTARIA: [
    { label: 'Validar', to: '/portaria' },
  ],
};

function TopNav() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const links = user ? NAV_LINKS[user.role] || [] : [];
  const overlay = location.pathname === '/';

  return (
    <header className={`topnav${overlay ? ' topnav-overlay' : ''}`}>
      <Link to="/" className="topnav-brand">
        <img src={logoImage} alt="Brota Tickets" />
      </Link>
      <button
        className="topnav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="16" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="11" y2="18"></line>
        </svg>
      </button>
      <div className={`topnav-actions${menuOpen ? ' is-open' : ''}`}>
        <nav className="topnav-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
          ))}
        </nav>
        {user && <LogoutButton />}
      </div>
    </header>
  );
}

export default TopNav;
