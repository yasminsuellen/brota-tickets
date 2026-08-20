const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { comparePassword, signToken, verifyToken };