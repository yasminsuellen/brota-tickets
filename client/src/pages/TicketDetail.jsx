import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatTime } from '../utils/formatDateTime';
import './TicketDetail.css';

function TicketDetail() {
    const { id } = useParams();
    const { token } = useAuth();

    const [reservation, setReservation] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [confirmingCancel, setConfirmingCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [cancelled, setCancelled] = useState(false);

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

    async function handleCopyCode() {
        await navigator.clipboard.writeText(reservation.ticket.qrToken);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    }

    async function handleCancel() {
        setCancelling(true);
        setCancelError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reservations/${id}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (!response.ok) {
                setCancelError(data.error);
                return;
            }

            setCancelled(true);
        } catch (err) {
            setCancelError('Não foi possível cancelar o ingresso. Tente novamente.');
        } finally {
            setCancelling(false);
        }
    }

    if (cancelled) {
        return (
            <div className="page ticket-detail">
                <PageHeader title="Seu ingresso" showBack />
                <div className="ticket-detail-card">
                    <p className="ticket-detail-meta">Ingresso cancelado. O lugar voltou a ficar disponível.</p>
                    <Link to="/meus-ingressos">← Voltar para Meus ingressos</Link>
                </div>
            </div>
        );
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
            <PageHeader title="Seu ingresso" showBack />
            <div className="ticket-detail-card">
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

                <div className="ticket-detail-code">
                    <p className="ticket-detail-code-label">Código do ingresso, caso o QR não funcione</p>
                    <button className="ticket-detail-code-value" onClick={handleCopyCode}>
                        {ticket.qrToken}
                    </button>
                    {codeCopied && <p className="ticket-detail-code-copied">Código copiado!</p>}
                </div>

                <button className="ticket-detail-share" onClick={handleShare}>
                    {copied ? 'Link copiado!' : 'Compartilhar ingresso'}
                </button>

                {confirmingCancel ? (
                    <div className="ticket-detail-cancel-confirm">
                        {cancelError && <p className="ticket-detail-error">{cancelError}</p>}
                        <p>Cancelar este ingresso? O lugar volta a ficar disponível.</p>
                        <div className="ticket-detail-cancel-actions">
                            <button
                                className="ticket-detail-cancel-back"
                                onClick={() => setConfirmingCancel(false)}
                                disabled={cancelling}
                            >
                                Voltar
                            </button>
                            <button
                                className="ticket-detail-cancel-confirm-button"
                                onClick={handleCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? 'Cancelando...' : 'Confirmar cancelamento'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button className="ticket-detail-cancel" onClick={() => setConfirmingCancel(true)}>
                        Cancelar ingresso
                    </button>
                )}
            </div>
        </div>
    );
}

export default TicketDetail;
