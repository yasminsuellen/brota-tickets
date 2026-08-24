import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';
import heroImage from '../assets/hero.png';
import logoImage from '../assets/logo.png';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

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

            if (data.user.role === 'ORGANIZADOR') {
                navigate('/organizador');
            } else if (data.user.role === 'PORTARIA') {
                navigate('/portaria');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Não foi possível conectar ao servidor. Tente novamente.');
        }
    }

    return (
        <div className="login">
            <div className="login-photo" style={{ backgroundImage: `url(${heroImage})` }}>
                <img
                    src={logoImage}
                    alt="Brota Tickets"
                    className="login-brand"
                    onClick={() => navigate('/')}
                />
            </div>
            <div className="login-form-side">
                <p className="login-eyebrow">BEM VINDO DE VOLTA</p>
                <h1 className="login-title">ENTRAR NA BROTA</h1>
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

export default Login;