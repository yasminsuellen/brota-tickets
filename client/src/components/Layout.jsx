import { useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import './Layout.css';

function Layout({ children }) {
    const location = useLocation();
    const showNav = location.pathname !== '/login';

    return (
        <div className="app-shell">
            {showNav && <TopNav />}
            {children}
        </div>
    );
}

export default Layout;