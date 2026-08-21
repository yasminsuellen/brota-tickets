import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoutButton from './LogoutButton';
import logoImage from '../assets/logo.png';
import './TopNav.css';

const NAV_LINKS = {
  CLIENTE: [
    { label: 'Descobrir', to: '/' },
    { label: 'Ingressos', to: '/meus-ingressos' },
  ],
  ORGANIZADOR: [
    { label: 'Painel', to: '/organizador' },
    { label: 'Catalogo', to: '/organizador/catalogo' },
  ],
  PORTARIA: [],
};

function TopNav() {
  const { user } = useAuth();
  const links = user ? NAV_LINKS[user.role] || [] : [];

  return (
    <header className="topnav">
      <div className="topnav-glow"></div>
      <Link to="/" className="topnav-brand">
        <img src={logoImage} alt="Brota Tickets" />
      </Link>
      <div className="topnav-actions">
        <nav className="topnav-links">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>{link.label}</Link>
          ))}
        </nav>
        <LogoutButton />
      </div>
    </header>
  );
}

export default TopNav;
