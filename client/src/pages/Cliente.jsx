import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Cliente.css';

const CATEGORIES = ['Tudo', 'Shows', 'Festivais', 'Teatro', 'Festas'];

function Cliente() {
    const [category, setCategory] = useState('Tudo');
    const [keyword, setKeyword] = useState('');
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    async function fetchEvents(searchKeyword, searchCategory) {
        setError('');

        const params = new URLSearchParams();
        if (searchKeyword) params.set('keyword', searchKeyword);
        if (searchCategory && searchCategory !== 'Tudo') params.set('category', searchCategory);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/published?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setEvents(data.events);
        } catch (err) {
            setError('Não foi possível buscar eventos. Tente novamente.');
        }
    }

    useEffect(() => {
        fetchEvents(keyword, category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    function handleSearch(e) {
        e.preventDefault();
        fetchEvents(keyword, category);
    }

    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="page cliente">
            <div className="cliente-header">
                <h1>Em alta</h1>
            </div>

            <div className="cliente-filters">
                <div className="cliente-categories">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            className={`cliente-category-btn${c === category ? ' is-active' : ''}`}
                            onClick={() => setCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <form className="cliente-search" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Buscar por evento ou local..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </form>
            </div>

            {error && <p className="cliente-error">{error}</p>}

            <div className="cliente-grid">
                {events.length === 0 ? (
                    <p className="cliente-empty">Nenhum evento encontrado.</p>
                ) : (
                    events.map((event) => (
                        <div className="cliente-card" key={event.id} onClick={() => navigate(`/eventos/${event.id}`)}>
                            <div
                                className="cliente-card-media"
                                style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                            ></div>
                            <div className="cliente-card-body">
                                <span className="cliente-date">
                                    {event.date?.slice(0, 10)} · {currency.format(event.price)}
                                </span>
                                <h3 className="cliente-card-title">{event.title}</h3>
                                <p className="cliente-card-location">{event.location}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Cliente;
