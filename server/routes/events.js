const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

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

module.exports = router;