import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { formatDate, formatTime } from '../utils/formatDateTime';
import './TicketDetail.css';

function TicketDetail() {
    const { id } = useParams();

    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        async function fetchTicket() {
            setError('');

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reservations/${id}/ticket`);
                const data = await response.json();

                if (!response.ok) {
                    setError(data.error);
                    return;
                }

                setReservation(data);
            } catch (err) {
                setError('Não foi possível carregar o ingresso. Tente novamente.');
            }
        }

        fetchTicket();
    }, [id]);

    async function handleShare() {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Meu ingresso Brota Tickets', url });
            } catch (err) {
                // user cancelled the share sheet, nothing to do
            }
            return;
        }

        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (error) {
        return (
            <div className="page ticket-detail">
                <p className="ticket-detail-error">{error}</p>
                <Link to="/">← Voltar para o início</Link>
            </div>
        );
    }

    if (!reservation) {
        return null;
    }

    const { event, ticket } = reservation;

    return (
        <div className="page ticket-detail">
            <div className="ticket-detail-card">
                <span className="ticket-detail-label">Seu ingresso</span>
                <h1>{event.title}</h1>
                <p className="ticket-detail-meta">
                    {formatDate(event.date)} · {formatTime(event.date)}
                </p>
                <p className="ticket-detail-meta">{event.location}</p>
                <p className="ticket-detail-item">
                    {reservation.seatCode
                        ? `Assento ${reservation.seatCode}`
                        : `${reservation.quantity} ${reservation.quantity === 1 ? 'ingresso' : 'ingressos'}`}
                </p>

                <div className="ticket-detail-qr">
                    <QRCodeSVG value={ticket.qrToken} size={200} />
                </div>

                <button className="ticket-detail-share" onClick={handleShare}>
                    {copied ? 'Link copiado!' : 'Compartilhar ingresso'}
                </button>
            </div>
        </div>
    );
}

export default TicketDetail;
