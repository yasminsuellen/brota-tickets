const SEAT_MAP_CAPACITY_LIMIT = 200;
const SEATS_PER_ROW = 15;

function getReservationType(capacity) {
    return capacity <= SEAT_MAP_CAPACITY_LIMIT ? 'SEAT_MAP' : 'QUANTITY';
}

function generateSeatCodes(capacity) {
    const codes = [];
    const rows = Math.ceil(capacity / SEATS_PER_ROW);

    for (let row = 0; row < rows; row++) {
        const rowLabel = String.fromCharCode(65 + row);
        const seatsInRow = Math.min(SEATS_PER_ROW, capacity - row * SEATS_PER_ROW);

        for (let seat = 1; seat <= seatsInRow; seat++) {
            codes.push(`${rowLabel}${seat}`);
        }
    }

    return codes;
}

module.exports = { getReservationType, generateSeatCodes };
