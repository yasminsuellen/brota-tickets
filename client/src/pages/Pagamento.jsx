import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Pagamento.css';

function Pagamento() {
    const location = useLocation();
    const { token } = useAuth();

    const { reservations, event } = location.state || {};

    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    async function handleDecision(decision) {
        setError('');
        setSubmitting(true);

        try {
            const responses = await Promise.all(
                reservations.map((reservation) =>
                    fetch(`${import.meta.env.VITE_API_BASE_URL}/reservations/${reservation.id}/pay`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ decision }),
                    }).then(async (response) => ({ ok: response.ok, data: await response.json() }))
                )
            );

            const failed = responses.find((r) => !r.ok);

            if (failed) {
                setError(failed.data.error);
                return;
            }

            setResult(responses[0].data.status);
        } catch (err) {
            setError('Não foi possível processar o pagamento. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    }

    if (!reservations || !event) {
        return (
            <div className="page pagamento">
                <p className="pagamento-error">Reserva não encontrada. Volte e inicie a reserva novamente.</p>
                <Link to="/eventos" className="pagamento-back">← Voltar para eventos</Link>
            </div>
        );
    }

    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const lineTotal = (reservation) =>
        reservation.seatCode ? Number(event.price) : Number(event.price) * reservation.quantity;
    const total = reservations.reduce((sum, reservation) => sum + lineTotal(reservation), 0);
    const ticketCount = reservations.reduce(
        (sum, reservation) => sum + (reservation.seatCode ? 1 : reservation.quantity),
        0
    );
    const plural = ticketCount > 1;

    if (result === 'CONFIRMADA') {
        return (
            <div className="page pagamento">
                <div className="pagamento-result is-success">
                    <h1>Pagamento confirmado</h1>
                    <p>{plural ? 'Seus ingressos' : 'Seu ingresso'} para {event.title} {plural ? 'foram garantidos' : 'foi garantido'}.</p>
                    <Link to="/eventos">Voltar para eventos</Link>
                </div>
            </div>
        );
    }

    if (result === 'RECUSADA') {
        return (
            <div className="page pagamento">
                <div className="pagamento-result is-declined">
                    <h1>Pagamento recusado</h1>
                    <p>{plural ? 'Suas reservas' : 'Sua reserva'} para {event.title} {plural ? 'foram canceladas' : 'foi cancelada'}.</p>
                    <Link to="/eventos">Voltar para eventos</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page pagamento">
            <h1>Feche o role</h1>

            {error && <p className="pagamento-error">{error}</p>}

            <div className="pagamento-card">
                <span className="pagamento-card-label">Confirme seu pedido</span>
                <h2>{event.title}</h2>

                {reservations.map((reservation) => (
                    <div className="pagamento-line" key={reservation.id}>
                        <span>{reservation.seatCode ? `Assento ${reservation.seatCode}` : `${reservation.quantity} ingressos`}</span>
                        <span>{currency.format(lineTotal(reservation))}</span>
                    </div>
                ))}

                <div className="pagamento-line pagamento-total">
                    <span>Total</span>
                    <span>{currency.format(total)}</span>
                </div>

                <div className="pagamento-actions">
                    <button className="pagamento-confirm" disabled={submitting} onClick={() => handleDecision('confirm')}>
                        Garantir meu ingresso
                    </button>
                    <button className="pagamento-decline" disabled={submitting} onClick={() => handleDecision('decline')}>
                        Recusar pagamento
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Pagamento;
