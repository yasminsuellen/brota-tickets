import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import { removeAccents } from '../utils/removeAccents';
import './Catalogo.css';

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function formatDateLabel(dateStr, timeStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const label = `${day} ${MONTHS[Number(month) - 1]} ${year}`;
    return timeStr ? `${label} · ${timeStr.slice(0, 5)}h` : label;
}

function Catalogo() {
    const [keyword, setKeyword] = useState('');
    const [events, setEvents] = useState([]);
    const [buffer, setBuffer] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();
    const seenTitlesRef = useRef(new Set());

    async function fetchRawPage(searchKeyword, pageNumber) {
        const params = new URLSearchParams({ keyword: searchKeyword, page: pageNumber });
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/catalog?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        const unique = data.events.filter((event) => {
            const key = event.title.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
            if (seenTitlesRef.current.has(key)) return false;
            seenTitlesRef.current.add(key);
            return true;
        });

        return { unique, rawHasMore: data.hasMore };
    }

    // Ticketmaster's raw pages often contain duplicate titles (same show,
    // different dates), so this keeps pulling raw pages into a buffer until
    // there are 10 unique events to show, or Ticketmaster runs out of pages.
    // shouldAbort lets a stale call (e.g. a StrictMode double-invoked effect,
    // or a newer search that started after this one) skip applying its result.
    async function loadBatch(searchKeyword, startPage, startBuffer, append, shouldAbort = () => false) {
        setError('');

        let localBuffer = startBuffer;
        let nextPage = startPage;
        let rawHasMore = true;

        try {
            while (localBuffer.length < 10 && rawHasMore) {
                const result = await fetchRawPage(searchKeyword, nextPage);
                localBuffer = [...localBuffer, ...result.unique];
                nextPage += 1;
                rawHasMore = result.rawHasMore;
            }
        } catch (err) {
            if (!shouldAbort()) setError('Não foi possível buscar eventos. Tente novamente.');
            return;
        }

        if (shouldAbort()) return;

        const batch = localBuffer.slice(0, 10);
        const remaining = localBuffer.slice(10);

        setEvents((current) => (append ? [...current, ...batch] : batch));
        setBuffer(remaining);
        setPage(nextPage);
        setHasMore(remaining.length > 0 || rawHasMore);
    }

    useEffect(() => {
        let ignore = false;
        seenTitlesRef.current = new Set();
        setLoading(true);
        loadBatch('', 0, [], false, () => ignore).finally(() => {
            if (!ignore) setLoading(false);
        });

        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleSearch(e) {
        e.preventDefault();
        seenTitlesRef.current = new Set();
        setLoading(true);
        await loadBatch(keyword, 0, [], false);
        setLoading(false);
    }

    async function handleLoadMore() {
        setLoadingMore(true);
        await loadBatch(keyword, page, buffer, true);
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
            {loading ? (
                <p className="catalogo-loading">Carregando eventos...</p>
            ) : (
                <div className="catalogo-list">
                    {events.map((event) => (
                        <div className="catalogo-row" key={event.id} onClick={() => handleSelect(event)}>
                            <div
                                className="catalogo-row-media"
                                style={event.image ? { backgroundImage: `url(${event.image})` } : undefined}
                            ></div>
                            <div className="catalogo-row-body">
                                <span className="catalogo-row-date">{formatDateLabel(event.date, event.time)}</span>
                                <h3 className="catalogo-row-title">{removeAccents(event.title)}</h3>
                                <p className="catalogo-row-location">{removeAccents(event.venue)}{event.city ? ` · ${removeAccents(event.city)}` : ''}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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