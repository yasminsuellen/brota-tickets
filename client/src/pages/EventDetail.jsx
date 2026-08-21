import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './EventDetail.css';

function EventDetail() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchEvent() {
            setError('');

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/published/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error);
                    return;
                }

                setEvent(data);
            } catch (err) {
                setError('Não foi possível carregar o evento. Tente novamente.');
            }
        }

        fetchEvent();
    }, [id, token]);

    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    if (error) {
        return (
            <div className="page event-detail">
                <p className="event-detail-error">{error}</p>
                <Link to="/eventos">← Voltar</Link>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <div className="page event-detail">
            <div className="event-detail-topline">
                <Link to="/eventos" className="event-detail-back">← Voltar</Link>
                <div className="event-detail-meta">
                    <span className="event-detail-datetime">
                        {event.date?.slice(0, 10)} · {event.date?.slice(11, 16)}
                    </span>
                    <p className="event-detail-location">{event.location}</p>
                </div>
            </div>

            <div className="event-detail-grid">
                <div className="event-detail-main">
                    <h1>{event.title}</h1>
                    <div className="event-detail-media"></div>

                    {event.description && (
                        <>
                            <h2>Sobre o evento</h2>
                            <p className="event-detail-description">{event.description}</p>
                        </>
                    )}
                </div>

                <div className="event-detail-sidebar">
                    <h2>{event.title}</h2>
                    <span className="event-detail-price">{currency.format(event.price)}</span>

                    <div className="event-detail-map"></div>

                    <button onClick={() => navigate(`/eventos/${id}/reservar`)}>Garantir meu ingresso</button>
                </div>
            </div>
        </div>
    );
}

export default EventDetail;
