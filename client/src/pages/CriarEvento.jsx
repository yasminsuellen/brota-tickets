import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import './CriarEvento.css';

function CriarEvento() {
    const location = useLocation();
    const selected = location.state;

    const [title, setTitle] = useState(selected?.title || '');
    const [category, setCategory] = useState(selected?.category || '');
    const [date, setDate] = useState(selected?.date || '');
    const [time, setTime] = useState(selected?.time?.slice(0, 5) || '');
    const [venue, setVenue] = useState(
        selected ? `${selected.venue ?? ''}${selected.city ? ' · ' + selected.city : ''}` : ''
    );
    const [capacity, setCapacity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl] = useState(selected?.image || '');
    const [error, setError] = useState('');

    const { token } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const isoDate = time ? `${date}T${time}` : date;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    category,
                    description,
                    imageUrl,
                    date: isoDate,
                    location: venue,
                    capacity,
                    price,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            navigate('/organizador');
        } catch (err) {
            setError('Não foi possível publicar o evento. Tente novamente.');
        }
    }

    return (
        <div className="page criar-evento">
            <PageHeader title="Criar evento" showBack />
            <form onSubmit={handleSubmit}>
                <div className="criar-evento-row">
                    <label>
                        Nome do evento
                        <input type="text" placeholder="Ex.: Festival Brota Sound" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </label>
                    <label>
                        Categoria
                        <input type="text" placeholder="Shows" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </label>
                </div>
                <div className="criar-evento-row">
                    <label>
                        Data
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </label>
                    <label>
                        Horário
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </label>
                </div>
                <div className="criar-evento-row">
                    <label>
                        Local
                        <input type="text" placeholder="Nome da casa ou espaço" value={venue} onChange={(e) => setVenue(e.target.value)} required />
                    </label>
                    <label>
                        Preço da entrada inteira
                        <input type="number" min="0" step="0.01" placeholder="50" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </label>
                </div>
                <div className="criar-evento-row">
                    <label>
                        Capacidade
                        <input type="number" min="1" placeholder="500" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                    </label>
                    <label>
                        Descrição
                        <textarea placeholder="O que torna essa noite especial?" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </label>
                </div>
                {error && <p className="criar-evento-error">{error}</p>}
                <button type="submit">Publicar evento</button>
            </form>
        </div>
    );
}

export default CriarEvento;
