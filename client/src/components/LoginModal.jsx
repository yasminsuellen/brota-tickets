import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

function LoginModal({ onSuccess, onClose }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            login(data.user, data.token);
            onSuccess?.();
        } catch (err) {
            setError('Não foi possível conectar ao servidor. Tente novamente.');
        }
    }

    return (
        <div className="login-modal-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                {onClose && (
                    <button type="button" className="login-modal-close" onClick={onClose} aria-label="Fechar">
                        ×
                    </button>
                )}
                <p className="login-eyebrow">BEM VINDO DE VOLTA</p>
                <h1 className="login-title">ENTRAR NA BROTA</h1>
                <p className="login-modal-hint">Faça login para continuar.</p>
                <form onSubmit={handleSubmit}>
                    <label>
                        Email
                        <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                    <label>
                        Senha
                        <input type="password" placeholder="*********" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </label>
                    {error && <p className="login-error">{error}</p>}
                    <button type="submit">ENTRAR</button>
                </form>
            </div>
        </div>
    );
}

export default LoginModal;
