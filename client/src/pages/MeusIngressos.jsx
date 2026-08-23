import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MeusIngressos.css';

const CATEGORIES = ['Tudo', 'Shows', 'Festivais', 'Teatro', 'Festas'];

function MeusIngressos() {
    const [category, setCategory] = useState('Tudo');
    const [keyword, setKeyword] = useState('');
    const [reservations, setReservations] = useState([]);
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
            }
        }

        fetchMine();
    }, [token]);

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
                <input
                    className="ingressos-search"
                    type="text"
                    placeholder="Buscar por evento ou local..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </div>

            {error && <p className="ingressos-error">{error}</p>}

            <div className="ingressos-list">
                {filtered.length === 0 ? (
                    <p className="ingressos-empty">Nenhum ingresso encontrado.</p>
                ) : (
                    filtered.map((reservation) => (
                        <div
                            className="ingressos-card"
                            key={reservation.id}
                            onClick={() => navigate(`/ingressos/${reservation.id}`)}
                        >
                            <div
                                className="ingressos-card-media"
                                style={
                                    reservation.event.imageUrl
                                        ? { backgroundImage: `url(${reservation.event.imageUrl})` }
                                        : undefined
                                }
                            ></div>
                            <div className="ingressos-card-body">
                                <span className="ingressos-date">
                                    {reservation.event.date?.slice(0, 10)} · {reservation.event.date?.slice(11, 16)}
                                </span>
                                <h3 className="ingressos-card-title">{reservation.event.title}</h3>
                                <p className="ingressos-card-location">{reservation.event.location}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MeusIngressos;
