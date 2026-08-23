import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/formatDateTime';
import { createReservation } from '../utils/createReservation';
import './EventDetail.css';

function EventDetail() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    async function handleReservar() {
        if (event.type === 'SEAT_MAP') {
            navigate(`/eventos/${id}/reservar`);
            return;
        }

        setError('');
        setSubmitting(true);

        try {
            const data = await createReservation(token, { eventId: id, quantity });
            navigate(`/reservas/${data.reservations[0].id}/pagamento`, {
                state: { reservations: data.reservations, event },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    if (error) {
        return (
            <div className="page event-detail">
                <p className="event-detail-error">{error}</p>
                <Link to="/eventos">← Voltar</Link>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="page event-detail">
                <div className="event-detail-topline">
                    <Link to="/eventos" className="event-detail-back">← Voltar</Link>
                    <div className="event-detail-meta">
                        <span className="skeleton skeleton-line" style={{ width: '160px' }}></span>
                        <span className="skeleton skeleton-line" style={{ width: '220px', marginTop: 8 }}></span>
                    </div>
                </div>

                <div className="event-detail-grid">
                    <div className="event-detail-main">
                        <div className="skeleton skeleton-line" style={{ width: '70%', height: 32, marginBottom: 16 }}></div>
                        <div className="skeleton event-detail-media"></div>
                    </div>

                    <div className="event-detail-sidebar">
                        <div className="skeleton skeleton-line" style={{ width: '40%', height: 24, marginBottom: 16 }}></div>
                        <div className="skeleton skeleton-line" style={{ width: '100%', height: 40 }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page event-detail">
            <div className="event-detail-topline">
                <Link to="/eventos" className="event-detail-back">← Voltar</Link>
                <div className="event-detail-meta">
                    <span className="event-detail-datetime">
                        {formatDate(event.date)} · {formatTime(event.date)}
                    </span>
                    <p className="event-detail-location">{event.location}</p>
                </div>
            </div>

            <div className="event-detail-grid">
                <div className="event-detail-main">
                    <h1>{event.title}</h1>
                    <div
                        className="event-detail-media"
                        style={event.imageUrl ? { backgroundImage: `url(${event.imageUrl})` } : undefined}
                    ></div>

                    {event.description && (
                        <>
                            <h2>Sobre o evento</h2>
                            <p className="event-detail-description">{event.description}</p>
                        </>
                    )}
                </div>

                <div className="event-detail-sidebar">
                    <span className="event-detail-price">{currency.format(event.price)}</span>

                    {event.type === 'SEAT_MAP' && (
                        <>
                            <div className="event-detail-seatmap-preview">
                                {event.seats.map((seat) => (
                                    <span
                                        key={seat.code}
                                        className={`event-detail-seat-dot${seat.taken ? ' is-taken' : ''}`}
                                        title={seat.code}
                                    ></span>
                                ))}
                            </div>
                            <div className="event-detail-seatmap-legend">
                                <span><i className="event-detail-seat-dot"></i> Disponível</span>
                                <span><i className="event-detail-seat-dot is-taken"></i> Ocupado</span>
                            </div>
                        </>
                    )}

                    {event.type === 'QUANTITY' && (
                        <div className="event-detail-quantity">
                            <span>Quantidade de ingressos</span>
                            <div className="event-detail-stepper">
                                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                                <span>{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity((q) => Math.min(event.remaining, q + 1))}
                                >
                                    +
                                </button>
                            </div>
                            <span className="event-detail-remaining">{event.remaining} ingressos disponíveis</span>
                        </div>
                    )}

                    <div className="event-detail-bottom">
                        {event.type === 'QUANTITY' && (
                            <div className="event-detail-total">
                                <span>Total</span>
                                <span className="event-detail-total-value">{currency.format(event.price * quantity)}</span>
                            </div>
                        )}

                        {error && <p className="event-detail-error">{error}</p>}

                        <button onClick={handleReservar} disabled={submitting}>
                            {submitting ? 'Processando...' : 'Garantir meu ingresso'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetail;
