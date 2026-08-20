import './Layout.css';

function Layout({ children }) {
    return <div className="app-shell">{children}</div>;
}

export default Layout;