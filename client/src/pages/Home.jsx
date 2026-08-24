import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import heroImage from '../assets/hero.png';
import promoImage from '../assets/home.jpg';
import SkeletonCard from '../components/SkeletonCard';
import { formatDate } from '../utils/formatDateTime';
import './Home.css';

const PREVIEW_POOL_SIZE = 15;
const PREVIEW_ROWS = 2;

function Home() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(PREVIEW_ROWS * 3);
    const { token } = useAuth();
    const { requireAuth } = useAuthModal();
    const gridRef = useRef(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/published`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });

                const data = await response.json();

                if (response.ok) {
                    setEvents(data.events.slice(0, PREVIEW_POOL_SIZE));
                }
            } catch (err) {
                // silently ignore, preview section just stays empty
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, [token]);

    // Fills exactly PREVIEW_ROWS rows of the auto-fill grid, whatever the
    // actual column count ends up being at the current screen width.
    useEffect(() => {
        const gridEl = gridRef.current;
        if (!gridEl) return;

        function updateVisibleCount() {
            const columns = getComputedStyle(gridEl).gridTemplateColumns.split(' ').filter(Boolean).length;
            setVisibleCount(Math.max(columns, 1) * PREVIEW_ROWS);
        }

        updateVisibleCount();
        const observer = new ResizeObserver(updateVisibleCount);
        observer.observe(gridEl);
        return () => observer.disconnect();
    }, []);

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
                    <Link to="/eventos" className="home-ver-tudo-desktop">Ver tudo →</Link>
                </div>

                <div className="home-grid" ref={gridRef}>
                    {loading
                        ? Array.from({ length: visibleCount }).map((_, i) => <SkeletonCard key={i} className="home-card" />)
                        : events.slice(0, visibleCount).map((event) => (
                            <div className="home-card" key={event.id} onClick={() => requireAuth(`/eventos/${event.id}`)}>
                                <div
                                    className="home-card-media"
                                    style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                                ></div>
                                <div className="home-card-body">
                                    <span className="home-date">
                                        {formatDate(event.date)} · {currency.format(event.price)}
                                    </span>
                                    <h3>{event.title}</h3>
                                    <p>{event.location}</p>
                                </div>
                            </div>
                        ))}
                </div>

                <Link to="/eventos" className="home-ver-tudo-mobile">Ver tudo →</Link>
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
