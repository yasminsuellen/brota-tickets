import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SkeletonCard from '../components/SkeletonCard';
import { formatDate, formatTime } from '../utils/formatDateTime';
import './MeusIngressos.css';

const CATEGORIES = ['Tudo', 'Shows', 'Festivais', 'Teatro', 'Festas'];

function MeusIngressos() {
    const [category, setCategory] = useState('Tudo');
    const [keywordInput, setKeywordInput] = useState('');
    const [keyword, setKeyword] = useState('');
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMine() {
            setError('');

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reservations/mine`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error);
                    return;
                }

                setReservations(data.reservations);
            } catch (err) {
                setError('Não foi possível buscar seus ingressos. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }

        fetchMine();
    }, [token]);

    function handleSearchSubmit(e) {
        e.preventDefault();
        setKeyword(keywordInput);
    }

    function handleClear() {
        setKeywordInput('');
        setKeyword('');
        setCategory('Tudo');
    }

    const filtered = reservations.filter((reservation) => {
        const matchesCategory =
            category === 'Tudo' || reservation.event.category?.toLowerCase() === category.toLowerCase();
        const search = keyword.trim().toLowerCase();
        const matchesKeyword =
            !search ||
            reservation.event.title.toLowerCase().includes(search) ||
            reservation.event.location.toLowerCase().includes(search);

        return matchesCategory && matchesKeyword;
    });

    // Multiple seats bought for the same show are separate reservations
    // (each seat needs its own QR for door validation), but they should
    // read as one card here, opening into a list of the individual tickets.
    const grouped = Object.values(
        filtered.reduce((groups, reservation) => {
            const key = reservation.event.id;
            if (!groups[key]) {
                groups[key] = { event: reservation.event, reservations: [] };
            }
            groups[key].reservations.push(reservation);
            return groups;
        }, {})
    );

    return (
        <div className="page ingressos">
            <div className="ingressos-header">
                <h1>Meus ingressos</h1>
            </div>

            <div className="ingressos-filters">
                <div className="ingressos-categories">
                    {CATEGORIES.map((c) => (
                        <button
                            key={c}
                            className={`ingressos-category-btn${c === category ? ' is-active' : ''}`}
                            onClick={() => setCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <form className="ingressos-search-form" onSubmit={handleSearchSubmit}>
                    <input
                        className="ingressos-search"
                        type="text"
                        placeholder="Buscar por evento ou local..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                    />
                    {(keywordInput || keyword || category !== 'Tudo') && (
                        <button type="button" className="ingressos-search-clear" aria-label="Limpar busca" onClick={handleClear}>
                            ×
                        </button>
                    )}
                </form>
            </div>

            {error && <p className="ingressos-error">{error}</p>}

            <div className="ingressos-list">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="ingressos-card" />)
                ) : grouped.length === 0 ? (
                    <p className="ingressos-empty">Nenhum ingresso encontrado.</p>
                ) : (
                    grouped.map((group) => {
                        const validatedCount = group.reservations.filter((r) => r.ticket?.validated).length;

                        return (
                        <div
                            className="ingressos-card"
                            key={group.event.id}
                            onClick={() => {
                                if (group.reservations.length === 1) {
                                    navigate(`/ingressos/${group.reservations[0].id}`);
                                } else {
                                    navigate(`/meus-ingressos/evento/${group.event.id}`, {
                                        state: { event: group.event, reservations: group.reservations },
                                    });
                                }
                            }}
                        >
                            <div
                                className="ingressos-card-media"
                                style={
                                    group.event.imageUrl
                                        ? { backgroundImage: `url(${group.event.imageUrl})` }
                                        : undefined
                                }
                            >
                                {group.reservations.length > 1 && (
                                    <span className="ingressos-card-count">{group.reservations.length} ingressos</span>
                                )}
                                {validatedCount > 0 && (
                                    <span className="ingressos-card-used">
                                        {group.reservations.length === 1
                                            ? 'Usado'
                                            : `${validatedCount}/${group.reservations.length} usados`}
                                    </span>
                                )}
                            </div>
                            <div className="ingressos-card-body">
                                <span className="ingressos-date">
                                    {formatDate(group.event.date)} · {formatTime(group.event.date)}
                                </span>
                                <h3 className="ingressos-card-title">{group.event.title}</h3>
                                <p className="ingressos-card-location">{group.event.location}</p>
                            </div>
                        </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default MeusIngressos;
