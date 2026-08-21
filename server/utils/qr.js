const crypto = require('crypto');

function signQrToken(reservationId) {
    const signature = crypto
        .createHmac('sha256', process.env.QR_SECRET)
        .update(reservationId)
        .digest('hex');

    return `${reservationId}.${signature}`;
}

function verifyQrToken(token) {
    if (typeof token !== 'string' || !token.includes('.')) {
        return null;
    }

    const [reservationId, signature] = token.split('.');

    if (!reservationId || !signature) {
        return null;
    }

    const expected = crypto.createHmac('sha256', process.env.QR_SECRET).update(reservationId).digest('hex');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (signatureBuffer.length !== expectedBuffer.length) {
        return null;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer) ? reservationId : null;
}

module.exports = { signQrToken, verifyQrToken };
