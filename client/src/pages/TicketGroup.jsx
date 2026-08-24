import { useLocation, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { formatDate, formatTime } from '../utils/formatDateTime';
import './TicketGroup.css';

function TicketGroup() {
    const location = useLocation();
    const navigate = useNavigate();
    const { event, reservations } = location.state || {};

    if (!event || !reservations) {
        return (
            <div className="page ticket-group">
                <p className="ticket-group-error">Ingressos não encontrados.</p>
                <Link to="/meus-ingressos">← Voltar para meus ingressos</Link>
            </div>
        );
    }

    return (
        <div className="page ticket-group">
            <PageHeader title={event.title} showBack />
            <p className="ticket-group-meta">
                {formatDate(event.date)} · {formatTime(event.date)}
            </p>
            <p className="ticket-group-meta">{event.location}</p>

            <div className="ticket-group-list">
                {reservations.map((reservation, i) => (
                    <div
                        key={reservation.id}
                        className="ticket-group-item"
                        onClick={() => navigate(`/ingressos/${reservation.id}`)}
                    >
                        <span>
                            {reservation.seatCode ? `Assento ${reservation.seatCode}` : `Ingresso ${i + 1}`}
                            {reservation.ticket?.validated && <span className="ticket-group-item-used">Usado</span>}
                        </span>
                        <span className="ticket-group-item-arrow">→</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TicketGroup;
