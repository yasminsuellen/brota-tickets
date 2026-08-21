const crypto = require('crypto');

function signQrToken(reservationId) {
    const signature = crypto
        .createHmac('sha256', process.env.QR_SECRET)
        .update(reservationId)
        .digest('hex');

    return `${reservationId}.${signature}`;
}

module.exports = { signQrToken };
