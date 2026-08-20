const express = require('express');
const router = express.Router();
const { comparePassword, signToken } = require('../utils/auth');
const prisma = require('../lib/prisma');

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = signToken({ id: user.id, role: user.role });

    res.json({
        token,
        user: { id: user.id, name: user.name, role: user.role }
    });
});

const { requireAuth } = require('../middleware/auth');

router.get('/me', requireAuth, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ id: user.id, name: user.name, role: user.role });
});

module.exports = router;