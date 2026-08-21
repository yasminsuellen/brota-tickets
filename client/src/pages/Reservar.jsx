import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Reservar.css';

function Reservar() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
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

    function toggleSeat(code) {
        setSelectedSeats((seats) =>
            seats.includes(code) ? seats.filter((s) => s !== code) : [...seats, code]
        );
    }

    async function handleSubmit() {
        setError('');
        setSubmitting(true);

        const body =
            event.type === 'SEAT_MAP'
                ? { eventId: id, seatCodes: selectedSeats }
                : { eventId: id, quantity };

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            navigate(`/reservas/${data.reservations[0].id}/pagamento`, {
                state: { reservations: data.reservations, event },
            });
        } catch (err) {
            setError('Não foi possível criar a reserva. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    }

    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    if (!event) {
        return error ? <p className="reservar-error">{error}</p> : null;
    }

    const total =
        event.type === 'SEAT_MAP'
            ? Number(event.price) * selectedSeats.length
            : Number(event.price) * quantity;
    const canSubmit = event.type === 'SEAT_MAP' ? selectedSeats.length > 0 : quantity >= 1;

    return (
        <div className="page reservar">
            <div className="reservar-topline">
                <Link to={`/eventos/${id}`} className="reservar-back">← Voltar</Link>
                <div className="reservar-header">
                    <h1>Monte seu ingresso</h1>
                    <p>{event.title}</p>
                </div>
            </div>

            {error && <p className="reservar-error">{error}</p>}

            {event.type === 'SEAT_MAP' ? (
                <>
                    <div className="reservar-palco">PALCO</div>
                    <div className="reservar-seatmap-wrap">
                        <div className="reservar-seatmap">
                            {event.seats.map((seat) => (
                                <button
                                    key={seat.code}
                                    className={`reservar-seat${seat.taken ? ' is-taken' : ''}${
                                        selectedSeats.includes(seat.code) ? ' is-selected' : ''
                                    }`}
                                    disabled={seat.taken}
                                    onClick={() => toggleSeat(seat.code)}
                                >
                                    {seat.code}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="reservar-legend">
                        <span><i className="reservar-legend-dot is-taken"></i> Ocupado</span>
                        <span><i className="reservar-legend-dot"></i> Disponível</span>
                        <span><i className="reservar-legend-dot is-selected"></i> Selecionado</span>
                    </div>
                    {selectedSeats.length > 0 && (
                        <p className="reservar-selected-count">
                            {selectedSeats.length} {selectedSeats.length === 1 ? 'assento selecionado' : 'assentos selecionados'}: {selectedSeats.join(', ')}
                        </p>
                    )}
                </>
            ) : (
                <div className="reservar-quantity">
                    <span>Quantidade de ingressos</span>
                    <div className="reservar-stepper">
                        <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                        <span>{quantity}</span>
                        <button
                            type="button"
                            onClick={() => setQuantity((q) => Math.min(event.remaining, q + 1))}
                        >
                            +
                        </button>
                    </div>
                    <span className="reservar-remaining">{event.remaining} ingressos disponíveis</span>
                </div>
            )}

            <div className="reservar-summary">
                <span>Total</span>
                <span className="reservar-total">{currency.format(total)}</span>
                <button disabled={!canSubmit || submitting} onClick={handleSubmit}>
                    Pagamento
                </button>
            </div>
        </div>
    );
}

export default Reservar;
