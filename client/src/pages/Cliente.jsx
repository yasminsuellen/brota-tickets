import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import { formatDate } from '../utils/formatDateTime';
import './Cliente.css';

const CATEGORIES = ['Tudo', 'Shows', 'Festivais', 'Teatro', 'Festas'];

function Cliente() {
    const [category, setCategory] = useState('Tudo');
    const [keyword, setKeyword] = useState('');
    const [events, setEvents] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    async function fetchEvents(searchKeyword, searchCategory, pageNumber, append) {
        setError('');

        const params = new URLSearchParams();
        if (searchKeyword) params.set('keyword', searchKeyword);
        if (searchCategory && searchCategory !== 'Tudo') params.set('category', searchCategory);
        params.set('page', pageNumber);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/published?${params}`, {
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
        // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting the skeleton on every category change, not just mount
        setLoading(true);
        fetchEvents(keyword, category, 0, false).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    async function handleSearch(e) {
        e.preventDefault();
        setLoading(true);
        await fetchEvents(keyword, category, 0, false);
        setLoading(false);
    }

    async function handleClear() {
        setKeyword('');
        setCategory('Tudo');
        setLoading(true);
        await fetchEvents('', 'Tudo', 0, false);
        setLoading(false);
    }

    async function handleLoadMore() {
        setLoadingMore(true);
        await fetchEvents(keyword, category, page + 1, true);
        setLoadingMore(false);
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
                    {(keyword || category !== 'Tudo') && (
                        <button type="button" className="cliente-search-clear" aria-label="Limpar busca" onClick={handleClear}>
                            ×
                        </button>
                    )}
                </form>
            </div>

            {error && <p className="cliente-error">{error}</p>}

            <div className="cliente-grid">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="cliente-card" />)
                ) : events.length === 0 ? (
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
                                    {formatDate(event.date)} · {currency.format(event.price)}
                                </span>
                                <h3 className="cliente-card-title">{event.title}</h3>
                                <p className="cliente-card-location">{event.location}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {hasMore && (
                <button
                    type="button"
                    className="cliente-ver-mais"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                >
                    {loadingMore ? 'Carregando...' : 'Ver mais'}
                </button>
            )}
        </div>
    );
}

export default Cliente;
