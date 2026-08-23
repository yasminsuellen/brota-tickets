export async function createReservation(token, body) {
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
        throw new Error(data.error || 'Não foi possível criar a reserva. Tente novamente.');
    }

    return data;
}
