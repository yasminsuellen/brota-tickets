import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { removeAccents } from '../utils/removeAccents';
import './Catalogo.css';

function Catalogo() {
    const [keyword, setKeyword] = useState('');
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    async function fetchEvents(searchKeyword, pageNumber, append) {
        setError('');

        try {
            const params = new URLSearchParams({ keyword: searchKeyword, page: pageNumber });
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/catalog?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setEvents((current) => (append ? [...current, ...data.events] : data.events));
            setPage(pageNumber);
            setHasMore(data.hasMore);
        } catch (err) {
            setError('Não foi possível buscar eventos. Tente novamente.');
        }
    }

    useEffect(() => {
        fetchEvents('', 0, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleSearch(e) {
        e.preventDefault();
        fetchEvents(keyword, 0, false);
    }

    async function handleLoadMore() {
        setLoadingMore(true);
        await fetchEvents(keyword, page + 1, true);
        setLoadingMore(false);
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
            <Link to="/organizador/eventos/novo" className="catalogo-em-branco">
                + Criar evento em branco
            </Link>
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
            {hasMore && (
                <button
                    type="button"
                    className="catalogo-ver-mais"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? 'Carregando...' : 'Ver mais'}
                </button>
            )}
        </div>
    );
}

export default Catalogo;