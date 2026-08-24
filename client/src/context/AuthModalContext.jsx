import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoginModal from '../components/LoginModal';

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
    const [pendingPath, setPendingPath] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Call this instead of navigate() for links that require login. Logged
    // in, it navigates immediately. Logged out, it opens the popup over
    // whatever page is currently showing instead of navigating away, the
    // navigation only happens after a successful login.
    function requireAuth(path) {
        if (user) {
            navigate(path);
        } else {
            setPendingPath(path);
        }
    }

    function handleLoggedIn() {
        const target = pendingPath;
        setPendingPath(null);
        if (target) navigate(target);
    }

    function close() {
        setPendingPath(null);
    }

    return (
        <AuthModalContext.Provider value={{ requireAuth }}>
            {children}
            {pendingPath && <LoginModal onSuccess={handleLoggedIn} onClose={close} />}
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    return useContext(AuthModalContext);
}
