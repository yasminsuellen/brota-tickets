const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const prisma = require('../lib/prisma');

router.get('/catalog', requireAuth, requireRole('ORGANIZADOR'), async (req, res) => {
    const { keyword } = req.query;
    const apiKey = process.env.TICKETMASTER_API_KEY;

    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('countryCode', 'BR');
    url.searchParams.set('size', '12');
    if (keyword) {
        url.searchParams.set('keyword', keyword);
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        const events = (data._embedded?.events || []).map((event) => ({
            id: event.id,
            title: event.name,
            date: event.dates?.start?.localDate,
            time: event.dates?.start?.localTime,
            venue: event._embedded?.venues?.[0]?.name,
            city: event._embedded?.venues?.[0]?.city?.name,
            image: event.images?.[0]?.url,
            category: event.classifications?.[0]?.segment?.name,
        }));

        res.json({ events });
    } catch (err) {
        res.status(502).json({ error: 'Não foi possível buscar eventos no Ticketmaster.' });
    }
});

router.post('/', requireAuth, requireRole('ORGANIZADOR'), async (req, res) => {
    const { title, category, description, date, location, capacity, price } = req.body;

    const event = await prisma.event.create({
        data: {
            title,
            category,
            description,
            date: new Date(date),
            location,
            capacity: Number(capacity),
            price: Number(price),
            organizerId: req.user.id,
        },
    });

    res.status(201).json(event);
});

router.get('/', requireAuth, requireRole('ORGANIZADOR'), async (req, res) => {
    const events = await prisma.event.findMany({
        where: { organizerId: req.user.id },
        orderBy: { date: 'asc' },
    });

    res.json({ events });
});

router.get('/stats', requireAuth, requireRole('ORGANIZADOR'), async (req, res) => {
    const events = await prisma.event.findMany({
        where: { organizerId: req.user.id },
        include: {
            reservations: {
                where: { status: 'CONFIRMADA' },
            },
        },
    });

    let ticketsSold = 0;
    let grossRevenue = 0;
    let totalCapacity = 0;

    for (const event of events) {
        const eventTickets = event.reservations.reduce(
            (sum, reservation) => sum + (reservation.quantity ?? 1),
            0
        );

        ticketsSold += eventTickets;
        grossRevenue += eventTickets * Number(event.price);
        totalCapacity += event.capacity;
    }

    const occupancy = totalCapacity > 0 ? (ticketsSold / totalCapacity) * 100 : 0;

    res.json({
        ticketsSold,
        grossRevenue,
        occupancy: Math.round(occupancy * 10) / 10,
    });
});

router.get('/:id', requireAuth, requireRole('ORGANIZADOR'), async (req, res) => {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });

    if (!event || event.organizerId !== req.user.id) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    res.json(event);
});

router.put('/:id', requireAuth, requireRole('ORGANIZADOR'), async (req, res) => {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });

    if (!existing || existing.organizerId !== req.user.id) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    const { title, category, description, date, location, capacity, price } = req.body;

    const event = await prisma.event.update({
        where: { id: req.params.id },
        data: {
            title,
            category,
            description,
            date: new Date(date),
            location,
            capacity: Number(capacity),
            price: Number(price),
        },
    });

    res.json(event);
});

module.exports = router;