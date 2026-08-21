import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { removeAccents } from '../utils/removeAccents';
import './Catalogo.css';

function Catalogo() {
    const [keyword, setKeyword] = useState('');
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    async function fetchEvents(searchKeyword) {
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/catalog?keyword=${encodeURIComponent(searchKeyword)}`, {
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
        fetchEvents('');
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        fetchEvents(keyword);
    }

    function handleSelect(event) {
        navigate('/organizador/eventos/novo', { state: event });
    }

    return (
        <div className="page catalogo">
            <PageHeader title="Escolha um evento do catálogo" showBack />
            <form className="catalogo-search" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Buscar por artista, show, evento..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <button type="submit">Buscar</button>
            </form>
            {error && <p className="catalogo-error">{error}</p>}
            <div className="catalogo-grid">
                {events.map((event) => (
                    <div className="catalogo-card" key={event.id} onClick={() => handleSelect(event)}>
                        <div
                            className="catalogo-card-media"
                            style={event.image ? { backgroundImage: `url(${event.image})` } : undefined}
                        ></div>
                        <div className="catalogo-card-body">
                            <span className="catalogo-date">{event.date}</span>
                            <h3 className="catalogo-card-title">{removeAccents(event.title)}</h3>
                            <p className="catalogo-card-location">{removeAccents(event.venue)}{event.city ? ` · ${removeAccents(event.city)}` : ''}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Catalogo;