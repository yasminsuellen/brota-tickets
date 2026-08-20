const { verifyToken } = require('../utils/auth');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ error: 'Acesso negado' });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };