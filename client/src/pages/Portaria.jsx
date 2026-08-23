import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDateTime';
import './Portaria.css';

const READER_ID = 'portaria-reader';

const RESULT_META = {
    VALIDO: { label: 'Ingresso válido', className: 'is-valid' },
    INVALIDO: { label: 'Ingresso inválido', className: 'is-invalid' },
    JA_UTILIZADO: { label: 'Ingresso já utilizado', className: 'is-used' },
    EVENTO_ERRADO: { label: 'Evento errado', className: 'is-wrong-event' },
};

function Portaria() {
    const { token } = useAuth();

    const [events, setEvents] = useState([]);
    const [eventId, setEventId] = useState('');
    const [mode, setMode] = useState('camera');
    const [manualCode, setManualCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const scannerRef = useRef(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/published`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (response.ok) {
                    setEvents(data.events);
                }
            } catch (err) {
                setError('Não foi possível carregar os eventos.');
            }
        }

        fetchEvents();
    }, [token]);

    useEffect(() => {
        if (!(eventId && mode === 'camera' && !result)) {
            return;
        }

        const scanner = new Html5Qrcode(READER_ID);
        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: 250 },
                (decodedText) => validate(decodedText)
            )
            .catch(() => {
                setError('Não foi possível acessar a câmera. Use a digitação manual.');
            });

        return () => {
            const activeScanner = scannerRef.current;
            scannerRef.current = null;

            if (!activeScanner) {
                return;
            }

            try {
                activeScanner.stop().then(() => activeScanner.clear()).catch(() => {});
            } catch (err) {
                // scanner never finished starting, nothing to stop
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, mode, result]);

    async function validate(qrToken) {
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reservations/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ qrToken, eventId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setResult(data);
        } catch (err) {
            setError('Não foi possível validar o ingresso. Tente novamente.');
        }
    }

    function handleManualSubmit(e) {
        e.preventDefault();
        if (manualCode.trim()) {
            validate(manualCode.trim());
        }
    }

    function handleNext() {
        setResult(null);
        setManualCode('');
    }

    if (result) {
        const meta = RESULT_META[result.result];

        return (
            <div className="page portaria">
                <div className={`portaria-result ${meta.className}`}>
                    <h1>{meta.label}</h1>
                    {result.event && <p className="portaria-result-event">{result.event.title}</p>}
                    {result.result === 'VALIDO' && (
                        <p className="portaria-result-item">
                            {result.seatCode
                                ? `Assento ${result.seatCode}`
                                : `${result.quantity} ${result.quantity === 1 ? 'ingresso' : 'ingressos'}`}
                        </p>
                    )}
                    <button className="portaria-next" onClick={handleNext}>
                        Validar próximo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page portaria">
            <h1>Portaria</h1>

            {error && <p className="portaria-error">{error}</p>}

            <select
                className="portaria-select"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
            >
                <option value="">Escolha um evento...</option>
                {events.map((event) => (
                    <option key={event.id} value={event.id}>
                        {event.title} — {formatDate(event.date)}
                    </option>
                ))}
            </select>

            {eventId && (
                <>
                    <div className="portaria-mode-toggle">
                        <button
                            className={mode === 'camera' ? 'is-active' : ''}
                            onClick={() => setMode('camera')}
                        >
                            Câmera
                        </button>
                        <button
                            className={mode === 'manual' ? 'is-active' : ''}
                            onClick={() => setMode('manual')}
                        >
                            Digitar código
                        </button>
                    </div>

                    {mode === 'camera' ? (
                        <div id={READER_ID} className="portaria-reader"></div>
                    ) : (
                        <form className="portaria-manual" onSubmit={handleManualSubmit}>
                            <input
                                type="text"
                                placeholder="Cole ou digite o código do ingresso"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                            />
                            <button type="submit">Validar</button>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}

export default Portaria;
