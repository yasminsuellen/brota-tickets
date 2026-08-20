import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('brota_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('brota_token'));

    function login(userData, tokenData) {
        setUser(userData);
        setToken(tokenData);
        localStorage.setItem('brota_user', JSON.stringify(userData));
        localStorage.setItem('brota_token', tokenData);
    }

    function logout() {
        setUser(null);
        setToken(null);
        localStorage.removeItem('brota_user');
        localStorage.removeItem('brota_token');
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}