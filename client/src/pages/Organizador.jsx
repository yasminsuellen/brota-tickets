import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDateTime';
import './Organizador.css';

function Organizador() {
    const [stats, setStats] = useState({ ticketsSold: 0, grossRevenue: 0, occupancy: 0 });
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Tudo');
    const [monthFilter, setMonthFilter] = useState('');
    const [ufFilter, setUfFilter] = useState('');
    const { user, token } = useAuth();

    useEffect(() => {
        async function fetchDashboard() {
            setError('');
            setLoading(true);

            try {
                const [statsRes, eventsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/events/stats`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/events`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const statsData = await statsRes.json();
                const eventsData = await eventsRes.json();

                if (!statsRes.ok || !eventsRes.ok) {
                    setError(statsData.error || eventsData.error);
                    return;
                }

                setStats(statsData);
                setEvents(eventsData.events);
            } catch (err) {
                setError('Não foi possível carregar o painel. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }

        fetchDashboard();
    }, [token]);

    async function handleDelete(eventId) {
        const confirmed = window.confirm(
            'Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita e removerá também as reservas e ingressos ligados a ele.'
        );

        if (!confirmed) return;

        setError('');
        setDeletingId(eventId);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error);
                return;
            }

            setEvents((current) => current.filter((event) => event.id !== eventId));
        } catch (err) {
            setError('Não foi possível excluir o evento. Tente novamente.');
        } finally {
            setDeletingId(null);
        }
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        setSearch(searchInput);
    }

    function handleClearFilters() {
        setSearchInput('');
        setSearch('');
        setCategoryFilter('Tudo');
        setMonthFilter('');
        setUfFilter('');
    }

    const proximoEvento = events.find((event) => new Date(event.date) >= new Date());
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const currencyNoDecimals = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const categories = [...new Set(events.map((event) => event.category).filter(Boolean))];

    const filteredEvents = events.filter((event) => {
        if (search && !event.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (categoryFilter !== 'Tudo' && event.category !== categoryFilter) return false;
        if (monthFilter && event.date?.slice(0, 7) !== monthFilter) return false;
        if (ufFilter && !event.location?.toLowerCase().includes(ufFilter.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="page painel">
            <div className="painel-header">
                <h1>Olá, {user?.name}</h1>
                <Link to="/organizador/catalogo" className="painel-criar-btn">+ Criar evento</Link>
            </div>

            {error && <p className="painel-error">{error}</p>}

            <div className="painel-cards">
                {loading ? (
                    <div className="painel-proximo skeleton" aria-hidden="true"></div>
                ) : (
                    proximoEvento && (
                        <div className="painel-proximo">
                            <span className="painel-proximo-label">Próximo evento</span>
                            <h2>{proximoEvento.title}</h2>
                            <p className="painel-proximo-location">{proximoEvento.location}</p>
                            <p>{formatDate(proximoEvento.date)}</p>
                        </div>
                    )
                )}
                <div className="painel-stat-card">
                    <span className="painel-stat-label">Ingressos vendidos</span>
                    {loading ? (
                        <span className="skeleton skeleton-line" style={{ width: '50%' }}></span>
                    ) : (
                        <span className="painel-stat-value">{stats.ticketsSold}</span>
                    )}
                </div>
                <div className="painel-stat-card">
                    <span className="painel-stat-label">Receita bruta</span>
                    {loading ? (
                        <span className="skeleton skeleton-line" style={{ width: '50%' }}></span>
                    ) : (
                        <span className="painel-stat-value">{currencyNoDecimals.format(stats.grossRevenue)}</span>
                    )}
                </div>
                <div className="painel-stat-card">
                    <span className="painel-stat-label">Ocupação</span>
                    {loading ? (
                        <span className="skeleton skeleton-line" style={{ width: '50%' }}></span>
                    ) : (
                        <span className="painel-stat-value">{stats.occupancy}%</span>
                    )}
                </div>
            </div>

            <div className="painel-filters">
                <form className="painel-filter-search-form" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        className="painel-filter-search"
                        placeholder="Buscar por nome..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    {(searchInput || search || categoryFilter !== 'Tudo' || monthFilter || ufFilter) && (
                        <button type="button" className="painel-filter-search-clear" aria-label="Limpar filtros" onClick={handleClearFilters}>
                            ×
                        </button>
                    )}
                </form>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="Tudo">Todas as categorias</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                />
                <input
                    type="text"
                    className="painel-filter-uf"
                    placeholder="UF"
                    maxLength={2}
                    value={ufFilter}
                    onChange={(e) => setUfFilter(e.target.value)}
                />
            </div>

            <div className="painel-table-wrap">
                <table className="painel-table">
                    <thead>
                        <tr>
                            <th>Ações</th>
                            <th className="painel-col-evento">Evento</th>
                            <th>Data</th>
                            <th>Local</th>
                            <th>Capacidade</th>
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td className="painel-empty" colSpan={6}>Carregando eventos...</td>
                            </tr>
                        ) : filteredEvents.length === 0 ? (
                            <tr>
                                <td className="painel-empty" colSpan={6}>
                                    {events.length === 0 ? 'Nenhum evento publicado ainda.' : 'Nenhum evento encontrado.'}
                                </td>
                            </tr>
                        ) : (
                            filteredEvents.map((event) => (
                                <tr key={event.id}>
                                    <td className="painel-table-actions">
                                        <button
                                            type="button"
                                            className="painel-icon-btn painel-icon-btn-delete"
                                            aria-label="Excluir evento"
                                            onClick={() => handleDelete(event.id)}
                                            disabled={deletingId === event.id}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                                                <path d="M10 11v6"></path>
                                                <path d="M14 11v6"></path>
                                            </svg>
                                        </button>
                                        <Link to={`/organizador/eventos/${event.id}`} className="painel-icon-btn" aria-label="Gerenciar evento">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 20h9"></path>
                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                                            </svg>
                                        </Link>
                                    </td>
                                    <td className="painel-col-evento" title={event.title}>{event.title}</td>
                                    <td>{formatDate(event.date)}</td>
                                    <td>{event.location}</td>
                                    <td>{event.capacity}</td>
                                    <td>{currency.format(event.price)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Organizador;
