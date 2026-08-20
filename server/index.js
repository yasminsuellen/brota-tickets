require('dotenv').config();

const cors = require('cors');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const eventsRoutes = require('./routes/events');
app.use('/events', eventsRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});