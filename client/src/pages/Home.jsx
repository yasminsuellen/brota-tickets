import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';
import promoImage from '../assets/home.jpg';
import './Home.css';

function Home() {
    const [events, setEvents] = useState([]);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/published`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (response.ok) {
                    setEvents(data.events.slice(0, 3));
                }
            } catch (err) {
                // silently ignore, preview section just stays empty
            }
        }

        fetchEvents();
    }, [token]);

    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="home">
            <div className="home-hero" style={{ backgroundImage: `url(${heroImage})` }}>
                <div className="home-hero-content">
                    <h1>Seu próximo role brota bem aqui</h1>
                    <p>Encontre experiências que merecem sair da sua lista e entrar na sua história.</p>
                </div>
            </div>

            <div className="page home-section">
                <div className="home-section-header">
                    <h2>Descubra o que brota perto de você</h2>
                    <Link to="/eventos">Ver tudo →</Link>
                </div>

                <div className="home-grid">
                    {events.map((event) => (
                        <div className="home-card" key={event.id} onClick={() => navigate(`/eventos/${event.id}`)}>
                            <div
                                className="home-card-media"
                                style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                            ></div>
                            <div className="home-card-body">
                                <span className="home-date">
                                    {event.date?.slice(0, 10)} · {currency.format(event.price)}
                                </span>
                                <h3>{event.title}</h3>
                                <p>{event.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="home-marquee-wrap">
                <div className="home-marquee-bg"></div>
                <div className="home-marquee">
                    <div className="home-marquee-track">
                        {Array.from({ length: 16 }).map((_, i) => (
                            <span key={i}>
                                {i % 2 === 0 ? 'BROTA TICKETS' : 'É HOJE QUE A CIDADE ACONTECE'}
                                <i className="home-marquee-dot"></i>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="page home-section">
                <div className="home-promo">
                    <div className="home-promo-media" style={{ backgroundImage: `url(${promoImage})` }}></div>
                    <div className="home-promo-body">
                        <span className="home-promo-eyebrow">A vida acontece ao vivo</span>
                        <h2>Tem sempre algo rolando</h2>
                        <p>Encontre experiências que merecem sair da sua lista e entrar na sua história.</p>
                        <Link to="/eventos" className="home-promo-btn">Explorar</Link>
                    </div>
                </div>

                <div className="home-info-cards">
                    <div className="home-info-card is-accent">
                        <h3>Ingresso na mão</h3>
                        <p>QR disponível na hora. Compartilhe com quem quiser!</p>
                    </div>
                    <div className="home-info-card is-accent-2">
                        <h3>Para não perder o timing</h3>
                        <p>Agenda clara, checkout rápido e ingresso que chega no seu bolso.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
