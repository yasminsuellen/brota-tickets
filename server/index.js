const express = require('express');
const app = express();
const PORT = process.env.PORT || 3333;

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});