import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import './GerenciarEvento.css';

function GerenciarEvento() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({ ticketsSold: 0, grossRevenue: 0, occupancy: 0 });
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchEvent() {
            setError('');
            setLoading(true);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.error);
                    return;
                }

                setStats(data.stats);
                setTitle(data.title);
                setCategory(data.category || '');
                setDate(data.date?.slice(0, 10) || '');
                setTime(data.date?.slice(11, 16) || '');
                setLocation(data.location);
                setCapacity(data.capacity);
                setPrice(data.price);
                setDescription(data.description || '');
                setImageUrl(data.imageUrl || '');
            } catch (err) {
                setError('Não foi possível carregar o evento. Tente novamente.');
            } finally {
                setLoading(false);
            }
        }

        fetchEvent();
    }, [id, token]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSaving(true);

        const isoDate = time ? `${date}T${time}` : date;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
                method: 'PUT',
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
                    location,
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
            setError('Não foi possível salvar as alterações. Tente novamente.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            'Tem certeza que deseja excluir este evento? Essa ação não pode ser desfeita e removerá também as reservas e ingressos ligados a ele.'
        );

        if (!confirmed) return;

        setError('');
        setDeleting(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.error);
                return;
            }

            navigate('/organizador');
        } catch (err) {
            setError('Não foi possível excluir o evento. Tente novamente.');
        } finally {
            setDeleting(false);
        }
    }

    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="page gerenciar-evento">
            <PageHeader title="Gerenciar evento" showBack />

            {error && <p className="gerenciar-evento-error">{error}</p>}

            {loading && (
                <div className="gerenciar-evento-cards">
                    <div className="gerenciar-evento-stat-card">
                        <span className="gerenciar-evento-stat-label">Ingressos vendidos</span>
                        <span className="skeleton skeleton-line" style={{ width: '50%' }}></span>
                    </div>
                    <div className="gerenciar-evento-stat-card">
                        <span className="gerenciar-evento-stat-label">Receita bruta</span>
                        <span className="skeleton skeleton-line" style={{ width: '50%' }}></span>
                    </div>
                    <div className="gerenciar-evento-stat-card">
                        <span className="gerenciar-evento-stat-label">Ocupação</span>
                        <span className="skeleton skeleton-line" style={{ width: '50%' }}></span>
                    </div>
                </div>
            )}

            {!loading && (
                <>
                    <div className="gerenciar-evento-cards">
                        <div className="gerenciar-evento-stat-card">
                            <span className="gerenciar-evento-stat-label">Ingressos vendidos</span>
                            <span className="gerenciar-evento-stat-value">{stats.ticketsSold}</span>
                        </div>
                        <div className="gerenciar-evento-stat-card">
                            <span className="gerenciar-evento-stat-label">Receita bruta</span>
                            <span className="gerenciar-evento-stat-value">{currency.format(stats.grossRevenue)}</span>
                        </div>
                        <div className="gerenciar-evento-stat-card">
                            <span className="gerenciar-evento-stat-label">Ocupação</span>
                            <span className="gerenciar-evento-stat-value">{stats.occupancy}%</span>
                        </div>
                    </div>

                    <h2 className="gerenciar-evento-subtitle">Editar informações</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="gerenciar-evento-row">
                            <label>
                                Nome do evento
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </label>
                            <label>
                                Categoria
                                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
                            </label>
                        </div>
                        <div className="gerenciar-evento-row">
                            <label>
                                Data
                                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            </label>
                            <label>
                                Horário
                                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                            </label>
                        </div>
                        <div className="gerenciar-evento-row">
                            <label>
                                Local
                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                            </label>
                            <label>
                                Preço da entrada inteira
                                <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </label>
                        </div>
                        <div className="gerenciar-evento-row">
                            <label>
                                Capacidade
                                <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                            </label>
                            <label>
                                Descrição
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                            </label>
                        </div>
                        <div className="gerenciar-evento-row gerenciar-evento-row-image">
                            <label>
                                URL da imagem
                                <input type="url" placeholder="https://..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                            </label>
                            <div className="gerenciar-evento-actions">
                                <button type="submit" disabled={saving}>Salvar alterações</button>
                                <button
                                    type="button"
                                    className="gerenciar-evento-delete"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                >
                                    Excluir evento
                                </button>
                            </div>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default GerenciarEvento;
