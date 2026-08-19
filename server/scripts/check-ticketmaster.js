require('dotenv').config();

const apiKey = process.env.TICKETMASTER_API_KEY;
const url = `http://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=BR&size=3`;

fetch(url)
    .then((res) => res.json())
    .then((data) => {
        console.log(JSON.stringify(data, null, 2));
    })
    .catch((err) => {
        console.error('Ticketmaster request failed:', err);
    });