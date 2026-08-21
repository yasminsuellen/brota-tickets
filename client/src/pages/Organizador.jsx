import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Organizador.css';

function Organizador() {
    const [stats, setStats] = useState({ ticketsSold: 0, grossRevenue: 0, occupancy: 0 });
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
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

    const proximoEvento = events.find((event) => new Date(event.date) >= new Date());
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="page painel">
            <div className="painel-header">
                <h1>Olá, {user?.name}</h1>
                <Link to="/organizador/catalogo" className="painel-criar-btn">+ Criar evento</Link>
            </div>

            {error && <p className="painel-error">{error}</p>}

            <div className="painel-cards">
                {loading ? (
                    <div className="painel-proximo painel-proximo-skeleton" aria-hidden="true"></div>
                ) : (
                    proximoEvento && (
                        <div className="painel-proximo">
                            <span className="painel-proximo-label">Próximo evento</span>
                            <h2>{proximoEvento.title}</h2>
                            <p className="painel-proximo-location">{proximoEvento.location}</p>
                            <p>{proximoEvento.date?.slice(0, 10)}</p>
                        </div>
                    )
                )}
                <div className="painel-stat-card">
                    <span className="painel-stat-label">Ingressos vendidos</span>
                    <span className="painel-stat-value">{stats.ticketsSold}</span>
                </div>
                <div className="painel-stat-card">
                    <span className="painel-stat-label">Receita bruta</span>
                    <span className="painel-stat-value">{currency.format(stats.grossRevenue)}</span>
                </div>
                <div className="painel-stat-card">
                    <span className="painel-stat-label">Ocupação</span>
                    <span className="painel-stat-value">{stats.occupancy}%</span>
                </div>
            </div>

            <div className="painel-table-wrap">
                <table className="painel-table">
                    <thead>
                        <tr>
                            <th>Evento</th>
                            <th>Data</th>
                            <th>Local</th>
                            <th>Capacidade</th>
                            <th>Preço</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td className="painel-empty" colSpan={5}>Nenhum evento publicado ainda.</td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id}>
                                    <td>{event.title}</td>
                                    <td>{event.date?.slice(0, 10)}</td>
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
